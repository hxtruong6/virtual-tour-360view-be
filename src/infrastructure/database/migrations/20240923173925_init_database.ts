/* eslint-disable max-len */
/* eslint-disable unicorn/template-indent */
/* eslint-disable promise/always-return */
/* eslint-disable @typescript-eslint/await-thenable */
import { type Kysely, sql } from 'kysely';

// -- https://gist.github.com/kjmph/5bd772b2c2df145aa645b837da7eca74
// -- Based off IETF draft, https://datatracker.ietf.org/doc/draft-peabody-dispatch-new-uuid-format/
async function createUUIDv7Function(db: Kysely<unknown>) {
	await db.executeQuery(
		sql`
			-- Create public schema if not exists
			CREATE SCHEMA IF NOT EXISTS public;
			create or replace function uuid_generate_v7()
			returns uuid
			as $$
			begin
			  -- use random v4 uuid as starting point (which has the same variant we need)
			  -- then overlay timestamp
			  -- then set version 7 by flipping the 2 and 1 bit in the version 4 string
			  return encode(
			    set_bit(
			      set_bit(
			        overlay(uuid_send(gen_random_uuid())
			                placing substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3)
			                from 1 for 6
			        ),
			        52, 1
			      ),
			      53, 1
			    ),
			    'hex')::uuid;
			end
			$$
			language plpgsql
			volatile;
		`.compile(db),
	);
}

async function createDatabaseSchema(db: Kysely<unknown>) {
	await db.executeQuery(
		sql`
			-- Extensions
			CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- for uuid_generate_v7()
			CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for GIN index

			-- Schemas
			CREATE SCHEMA IF NOT EXISTS app;

			-- ===========================================
			-- CORE USER MANAGEMENT
			-- ===========================================

			-- Users: Store user accounts and wallet information
			CREATE TABLE app.users (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				username VARCHAR(50) UNIQUE NOT NULL,
				email VARCHAR(255) UNIQUE,
                phone_number VARCHAR(20),
                phone_country_code VARCHAR(5),
				password_hash VARCHAR(255),
				wallet_address VARCHAR(42) UNIQUE, -- Blockchain wallet address (e.g., Ethereum)
				display_name VARCHAR(100),
				avatar_url VARCHAR(500),
				level INTEGER DEFAULT 1,
				experience_points BIGINT DEFAULT 0,
				last_login TIMESTAMPTZ,
				referral_code VARCHAR(20) UNIQUE,
				referred_by UUID REFERENCES app.users(id),
				lang_tag VARCHAR(10),
				location VARCHAR(255),
				timezone VARCHAR(50),
				account_status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'deleted'
				account_status_at TIMESTAMPTZ,
				login_attempts INTEGER DEFAULT 0,
				last_failed_login_at TIMESTAMPTZ,
				account_verified_at TIMESTAMPTZ,
				email_verified_at TIMESTAMPTZ,
				phone_number_verified_at TIMESTAMPTZ,
				metadata JSONB DEFAULT '{}',
				nk_account_id VARCHAR(255) UNIQUE, -- Nakama account ID
                user_type VARCHAR(20) DEFAULT 'user', -- 'user', 'admin'
				enable_farming BOOLEAN DEFAULT FALSE,
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				deleted_at TIMESTAMPTZ,
				created_by UUID REFERENCES app.users(id),
				updated_by UUID REFERENCES app.users(id),
				deleted_by UUID REFERENCES app.users(id),
                -- unique index for phone number and phone country code
                UNIQUE(phone_country_code, phone_number),
                -- unique (username, wallet_address)
                UNIQUE(username, wallet_address)
			);

			CREATE INDEX idx_users_wallet_address ON app.users(wallet_address);
			CREATE INDEX idx_users_username ON app.users(username);
			CREATE INDEX idx_users_email ON app.users(email);
			CREATE INDEX idx_users_referral_code ON app.users(referral_code);

			-- ===========================================
			-- WALLET & CURRENCY SYSTEM
			-- ===========================================

			-- Wallets: Track user balances for different currencies
			CREATE TABLE app.wallets (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				wallet_address VARCHAR(42) NOT NULL,
				currency_type VARCHAR(20) NOT NULL, -- 'coin', 'gold', 'gem', 'ticket'
				balance DECIMAL(18,8) DEFAULT 0,
				locked_balance DECIMAL(18,8) DEFAULT 0, -- For pending transactions
				blockchain_hash VARCHAR(66), -- Latest transaction hash
				status VARCHAR(20) DEFAULT 'active', -- 'active', 'frozen', 'pending'
				version BIGINT DEFAULT 0, -- For optimistic locking
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				deleted_at TIMESTAMPTZ,
				created_by UUID REFERENCES app.users(id),
				updated_by UUID REFERENCES app.users(id),
				deleted_by UUID REFERENCES app.users(id),
				UNIQUE(user_id, currency_type)
			);

			CREATE INDEX idx_wallets_user_id ON app.wallets(user_id);
			CREATE INDEX idx_wallets_wallet_address ON app.wallets(wallet_address);
			CREATE INDEX idx_wallets_currency_type ON app.wallets(currency_type);

			-- Wallet Transactions: Track all wallet movements
			CREATE TABLE app.wallet_transactions (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				wallet_id UUID NOT NULL REFERENCES app.wallets(id),
				transaction_type VARCHAR(30) NOT NULL, -- 'deposit', 'withdraw', 'battle_reward', 'purchase', 'farming_reward', 'marketplace_sale', 'marketplace_purchase'
				currency_type VARCHAR(20) NOT NULL,
				amount DECIMAL(18,8) NOT NULL,
				balance_before DECIMAL(18,8) NOT NULL,
				balance_after DECIMAL(18,8) NOT NULL,
				reference_id UUID, -- Reference to battle, purchase, etc.
				reference_type VARCHAR(50), -- 'battle', 'purchase', 'farming', 'trade', 'marketplace_transaction'
				blockchain_hash VARCHAR(66),
				status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
				metadata JSONB DEFAULT '{}',
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				created_by UUID REFERENCES app.users(id)
			);

			CREATE INDEX idx_wallet_transactions_user_id ON app.wallet_transactions(user_id);
			CREATE INDEX idx_wallet_transactions_wallet_id ON app.wallet_transactions(wallet_id);
			CREATE INDEX idx_wallet_transactions_created_at ON app.wallet_transactions(created_at DESC);

			-- ===========================================
			-- NFT & ITEMS SYSTEM
			-- ===========================================

			-- Items: Store item templates and definitions
			CREATE TABLE app.items (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				item_code VARCHAR(50) UNIQUE NOT NULL,
				item_name VARCHAR(100) NOT NULL,
				item_type VARCHAR(30) NOT NULL, -- 'weapon', 'armor', 'consumable', 'plant', 'material'
				rarity VARCHAR(20) NOT NULL, -- 'common', 'uncommon', 'rare', 'epic', 'legendary'
				category VARCHAR(30), -- 'sword', 'shield', 'potion', 'seed'
				stats JSONB DEFAULT '{}', -- { "attack": 10, "defense": 5, "speed": 2 }
				requirements JSONB DEFAULT '{}', -- { "level": 5, "class": "warrior" }
				effects JSONB DEFAULT '{}', -- { "heal": 50, "buff": "strength" }
				base_price DECIMAL(10,2) DEFAULT 0, -- price when buy from shop
                sell_price DECIMAL(10,2) DEFAULT 0, -- price when sell to shop
                price_currency VARCHAR(20) DEFAULT 'coin', -- 'coin', 'gem'
				max_stack INTEGER DEFAULT 1, -- max stack of the item
                is_shop_item BOOLEAN DEFAULT FALSE, -- is item in shop
				is_tradeable BOOLEAN DEFAULT TRUE, -- is item tradeable
				is_consumable BOOLEAN DEFAULT FALSE, -- is item consumable
                is_active BOOLEAN DEFAULT TRUE, -- is item active
				description TEXT,
				icon_url VARCHAR(500),
				metadata JSONB DEFAULT '{}', -- { "description": "Upgrade your character's stats", "iconUrl": "https://example.com/icon.png", "description_vi": "Upgrade your character's stats", "iconUrl_vi": "https://example.com/icon.png" }
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				deleted_at TIMESTAMPTZ,
				created_by UUID REFERENCES app.users(id),
				updated_by UUID REFERENCES app.users(id),
				deleted_by UUID REFERENCES app.users(id)
			);

			CREATE INDEX idx_items_item_code ON app.items(item_code);
			CREATE INDEX idx_items_type_rarity ON app.items(item_type, rarity);

			-- ===========================================
			-- SKILL SYSTEM
			-- ===========================================

			-- Skills: Store skill templates and definitions
			CREATE TABLE app.skill_templates (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				code VARCHAR(50) UNIQUE NOT NULL, -- 'METAL_01', 'TREE_07', etc.
				name VARCHAR(100) NOT NULL,
				element_type VARCHAR(20) NOT NULL, -- 'metal', 'wood', 'water', 'fire', 'earth'
				primary_attribute_type VARCHAR(30) NOT NULL, -- 'damage', 'critical_strike', 'armor', 'armor_penetration', 'damage_reflection', 'life_steal', 'poison', 'anti_toxic', 'fire_poison', 'hp_recovery', 'skip_all'
				primary_attribute_probability INTEGER NOT NULL DEFAULT 100, -- Percentage chance to apply
				primary_attribute_base_from INTEGER NOT NULL,
				primary_attribute_base_to INTEGER NOT NULL,
				primary_attribute_rate VARCHAR(20) NOT NULL, -- 'point', 'percent'
				secondary_attribute_type VARCHAR(30), -- 'Critical Strike', 'Armor', 'Armor Penetration', 'Damage Reflection', 'Life Steal', 'Poison', 'Anti Toxic', 'Fire Poison', 'HP Recovery', 'Skip All'
				secondary_attribute_probability INTEGER DEFAULT 0, -- Percentage chance to apply
				secondary_attribute_base_from INTEGER DEFAULT 0,
				secondary_attribute_base_to INTEGER DEFAULT 0,
				secondary_attribute_rate VARCHAR(20), -- 'point', 'percent'
				skill_image_url VARCHAR(500),
				description TEXT,
				status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'deprecated'
				metadata JSONB DEFAULT '{}', -- Additional skill data { "description_vi": "Description of the skill" , "name_vi": "Name of the skill" }
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				deleted_at TIMESTAMPTZ,
				created_by UUID REFERENCES app.users(id),
				updated_by UUID REFERENCES app.users(id),
				deleted_by UUID REFERENCES app.users(id)
			);

           -- Characters: Store player-owned characters (NFTs)
			CREATE TABLE app.characters (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				is_nft BOOLEAN DEFAULT FALSE, -- whether the character is an NFT
				token_id VARCHAR(64) UNIQUE DEFAULT NULL, -- Blockchain NFT ID
				character_name VARCHAR(100) NOT NULL,
				character_class VARCHAR(50) NOT NULL, -- 'warrior', 'mage', 'archer', 'rogue'
				element_type VARCHAR(20) NOT NULL, -- 'metal', 'wood', 'water', 'fire', 'earth'
				rarity VARCHAR(20) NOT NULL, -- 'common', 'uncommon', 'rare', 'epic', 'legendary'
				level INTEGER DEFAULT 1,
				experience_points BIGINT DEFAULT 0,
				base_stats JSONB NOT NULL DEFAULT '{}', -- { "strength": 15, "speed": 12, "defense": 10, "hp": 100 }
				current_stats JSONB NOT NULL DEFAULT '{}', -- Including equipment bonuses
				equipped_items JSONB DEFAULT '{}', -- { "weapon": "item_id", "armor": "item_id" }
				equipped_auxiliary_items JSONB DEFAULT '{}', -- { "vital_elixir": true, "antidote": true }
				appearance JSONB DEFAULT '{}', -- Character customization data
				blockchain_hash VARCHAR,
				status VARCHAR(20) DEFAULT 'owned', -- 'owned', 'listed', 'transferred', 'battling', 'in_marketplace', 'dead'
				marketplace_listing_id UUID DEFAULT NULL, -- Reference to marketplace.listings(id) for cross-schema tracking
				last_battle_at TIMESTAMPTZ,
				lifetime_duration_in_hours INTEGER, -- total lifetime duration that the character can live
				start_lifetime TIMESTAMPTZ, -- the date when the character was born
				end_lifetime TIMESTAMPTZ, -- the date when the character will die
				required_food INTEGER, -- the amount of food required to keep the character alive
				current_energy INTEGER, -- the amount of energy of the character, default is 0
				used_energy_in_day INTEGER, -- the amount of energy used by the character in the last 24 hours, default is 0
                metadata JSONB DEFAULT '{}', -- Character-specific data { "egg_type": "gen1", "egg_id": "item_id" }
                egg_type VARCHAR(20) NOT NULL, -- 'gen1', 'gen2'
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				deleted_at TIMESTAMPTZ,
				created_by UUID REFERENCES app.users(id),
				updated_by UUID REFERENCES app.users(id),
				deleted_by UUID REFERENCES app.users(id)
			);

			CREATE INDEX idx_characters_user_id ON app.characters(user_id);
			CREATE INDEX idx_characters_token_id ON app.characters(token_id);

			-- Character Skills: Track skills equipped by characters
			CREATE TABLE app.character_skills (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				character_id UUID NOT NULL REFERENCES app.characters(id) ON DELETE CASCADE,
				skill_id UUID DEFAULT NULL, -- NULL for empty slot (skill_item_id)
                skill_code VARCHAR(50) DEFAULT NULL, -- NULL for empty slot
				slot_position INTEGER NOT NULL CHECK (slot_position BETWEEN 0 AND 19), -- Position in skill lineup (0-19)
				is_active BOOLEAN DEFAULT FALSE, -- Whether the skill is active in this slot
				metadata JSONB DEFAULT '{}', -- Skill-specific data for this character
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				created_by UUID REFERENCES app.users(id),
				updated_by UUID REFERENCES app.users(id),
				UNIQUE(character_id, slot_position), -- character can have only one skill in each slot
				UNIQUE(character_id, skill_id), -- character can have only one skill with same skill_id
                UNIQUE(character_id, skill_code) -- character can have only one skill with same skill_code
			);

			CREATE INDEX idx_character_skills_character_id ON app.character_skills(character_id);
			CREATE INDEX idx_character_skills_skill_id ON app.character_skills(skill_id);
			CREATE INDEX idx_character_skills_position ON app.character_skills(character_id, slot_position);

			-- Elemental Affinity: Define relationships between elements
			CREATE TABLE app.elemental_affinity (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				attacker_element VARCHAR(20) NOT NULL, -- 'metal', 'wood', 'water', 'fire', 'earth'
				defender_element VARCHAR(20) NOT NULL,
				attack_modifier DECIMAL(5,2) DEFAULT 0, -- Percentage modifier (-50.00 to +50.00)
				defense_modifier DECIMAL(5,2) DEFAULT 0, -- Percentage modifier (-50.00 to +50.00)
				description TEXT,
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				UNIQUE(attacker_element, defender_element)
			);

			CREATE INDEX idx_elemental_affinity_attacker ON app.elemental_affinity(attacker_element);
			CREATE INDEX idx_elemental_affinity_defender ON app.elemental_affinity(defender_element);


			-- User Inventory: Track owned items
			CREATE TABLE app.user_inventories (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				item_id UUID NOT NULL REFERENCES app.items(id),
                skill_id UUID,
				quantity INTEGER NOT NULL DEFAULT 1,
				locked_quantity INTEGER DEFAULT 0, -- Quantity locked in marketplace listings
				acquired_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				metadata JSONB DEFAULT '{}', -- Item-specific data
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				deleted_at TIMESTAMPTZ,
				created_by UUID REFERENCES app.users(id),
				updated_by UUID REFERENCES app.users(id),
				deleted_by UUID REFERENCES app.users(id),
				UNIQUE(user_id, item_id, skill_id)
			);

			CREATE INDEX idx_user_inventories_user_id ON app.user_inventories(user_id);
			CREATE INDEX idx_user_inventories_item_id ON app.user_inventories(item_id);

			-- ===========================================
			-- FARMING SYSTEM
			-- ===========================================
			-- User Lands: Store farming land (NFTs). this is whole land for manage each crop
            -- each land has 16 slots for crop
			CREATE TABLE app.user_lands (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				token_id VARCHAR(64) DEFAULT NULL UNIQUE, -- Blockchain NFT ID
				land_type VARCHAR(30) NOT NULL DEFAULT 'basic', -- 'basic', 'premium', 'legendary'
				level INTEGER DEFAULT 1,
				fertility INTEGER DEFAULT 100, -- 0-100, affects yield
				upgrades JSONB DEFAULT '{}', -- { "irrigation": true, "fertilizer": 2 }
				experience_points BIGINT DEFAULT 0,
				status VARCHAR(20) DEFAULT 'owned', -- 'owned', 'listed', 'transferred', 'in_marketplace'
				marketplace_listing_id UUID, -- Reference to marketplace.listings(id) for cross-schema tracking
				season VARCHAR(50) DEFAULT 'spring',
                metadata JSONB DEFAULT '{}', -- { "stolen_times_in_day": 0, "stolen_amount_in_day": 0, "last_stolen_at": "2025-01-01T00:00:00Z" }
                has_breakpoint_level_up BOOLEAN DEFAULT FALSE, -- whether the land has breakpoint level up
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				deleted_at TIMESTAMPTZ,
				created_by UUID REFERENCES app.users(id),
				updated_by UUID REFERENCES app.users(id),
				deleted_by UUID REFERENCES app.users(id)
			);


			CREATE INDEX idx_user_lands_user_id ON app.user_lands(user_id);
			CREATE INDEX idx_user_lands_token_id ON app.user_lands(token_id);


            -- User land crops: Store each crop in the land
            CREATE TABLE app.land_crops (
                id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
                land_id UUID NOT NULL REFERENCES app.user_lands(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
                status VARCHAR(20) NOT NULL DEFAULT 'locked', -- 'locked', 'available'.
                growth_stage VARCHAR(20) NOT NULL DEFAULT 'empty', -- 'empty', 'seed', 'sprout', 'growing', 'mature', 'ready_to_harvest'
                growth_status VARCHAR(20) NOT NULL DEFAULT 'empty', -- 'empty', 'normal', 'drought', 'fertilized'
                slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 0 AND 15),
                seed_quantity INTEGER NOT NULL DEFAULT 0,
                last_harvest_at TIMESTAMPTZ,
                last_plant_at TIMESTAMPTZ,
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMPTZ,
                created_by UUID REFERENCES app.users(id),
                updated_by UUID REFERENCES app.users(id),
                deleted_by UUID REFERENCES app.users(id)
            );

            CREATE INDEX idx_land_crops_user_id_land_id ON app.land_crops(user_id, land_id);
            CREATE INDEX idx_land_crops_land_id_slot_number ON app.land_crops(land_id, slot_number);

            -- unique constraint for land_id and slot_number
            ALTER TABLE app.land_crops ADD CONSTRAINT unique_land_id_slot_number UNIQUE (land_id, slot_number);

			-- Farming History: Track planting and harvesting
			CREATE TABLE app.farming_histories (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				land_id UUID NOT NULL REFERENCES app.user_lands(id),
				action_type VARCHAR(20) NOT NULL, -- 'plant', 'harvest', 'water', 'fertilize', 'help_water', 'help_fertilize', 'steal'
                land_crop_id UUID REFERENCES app.land_crops(id),
				slot_number INTEGER,
				seed_quantity INTEGER DEFAULT 0, -- amount of seed planted
				experience_gained INTEGER DEFAULT 0, -- amount of experience received when harvest
				coins_earned INTEGER DEFAULT 0, -- amount of coins received when harvest
				stolen_amount INTEGER DEFAULT 0, -- amount of magic grass stolen (for steal action)
				helper_user_id UUID REFERENCES app.users(id), -- user who helped (for help actions)
				action_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				metadata JSONB DEFAULT '{}', -- save drop item when harvest
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
			);

			CREATE INDEX idx_farming_histories_user_id ON app.farming_histories(user_id);
			CREATE INDEX idx_farming_histories_land_id ON app.farming_histories(land_id);

			-- ===========================================
			-- BATTLE SYSTEM
			-- ===========================================

			-- Battle Sessions: Track ongoing and completed battles
			CREATE TABLE app.battle_sessions (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				battle_type VARCHAR(20) NOT NULL, -- 'pve', 'pvp', 'arena', 'raid'
				battle_mode VARCHAR(20) NOT NULL, -- 'ranked', 'casual', 'tournament'
				initiator_id UUID NOT NULL REFERENCES app.users(id),
				opponent_id UUID REFERENCES app.users(id), -- NULL for PvE
				initiator_character_id UUID NOT NULL REFERENCES app.characters(id),
				opponent_character_id UUID REFERENCES app.characters(id),
				enemy_data JSONB, -- For PvE enemies
				battle_state JSONB NOT NULL DEFAULT '{}', -- Current battle state
				battle_config JSONB DEFAULT '{}', -- Battle rules and settings
				status VARCHAR(20) DEFAULT 'preparing', -- 'preparing', 'active', 'completed', 'cancelled'
				winner_id UUID REFERENCES app.users(id),
				battle_result JSONB, -- Detailed battle outcome
				rewards JSONB DEFAULT '{}', -- Rewards distributed
				duration_seconds INTEGER,
				started_at TIMESTAMPTZ,
				ended_at TIMESTAMPTZ,
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
			);

			-- Battle Actions: Store battle turn-by-turn actions
			CREATE TABLE app.battle_actions (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				battle_id UUID NOT NULL, -- References battle_sessions.id
				user_id UUID NOT NULL REFERENCES app.users(id),
				character_id UUID NOT NULL REFERENCES app.characters(id),
				turn_number INTEGER NOT NULL,
				action_type VARCHAR(30) NOT NULL, -- 'skill', 'item', 'pass'
				skill_id UUID, -- Which skill was used
				skill_slot_position INTEGER, -- Which skill slot was used (1-8)
				item_type VARCHAR(30), -- 'vital_elixir', 'antidote'
				action_data JSONB NOT NULL, -- Action details
				result JSONB, -- Action results (damage, effects, status changes)
				timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
			);

			CREATE INDEX idx_battle_sessions_initiator ON app.battle_sessions(initiator_id, initiator_character_id);
			CREATE INDEX idx_battle_sessions_created_at ON app.battle_sessions(created_at DESC);

			CREATE INDEX idx_battle_actions_user_id ON app.battle_actions(user_id);
			CREATE INDEX idx_battle_actions_timestamp ON app.battle_actions(timestamp DESC);

			-- ===========================================
			-- SOCIAL SYSTEM
			-- ===========================================

			-- Friends: Manage player relationships
			CREATE TABLE app.friends (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				friend_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				status VARCHAR(20) NOT NULL, -- 'pending', 'accepted', 'blocked', 'rejected'
				requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				accepted_at TIMESTAMPTZ,
				blocked_at TIMESTAMPTZ,
				last_interaction_at TIMESTAMPTZ,
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				CHECK (user_id != friend_id),
				UNIQUE(user_id, friend_id)
			);

			CREATE INDEX idx_friends_user_id ON app.friends(user_id);
			CREATE INDEX idx_friends_friend_id ON app.friends(friend_id);

			-- Clans: Manage player groups
			CREATE TABLE app.clans (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				clan_name VARCHAR(100) UNIQUE NOT NULL,
				clan_tag VARCHAR(10) UNIQUE NOT NULL,
				owner_id UUID NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
				description TEXT,
				level INTEGER DEFAULT 1,
				experience_points BIGINT DEFAULT 0,
				member_limit INTEGER DEFAULT 50,
				current_members INTEGER DEFAULT 1,
				clan_type VARCHAR(20) DEFAULT 'public', -- 'public', 'private', 'invite_only'
				requirements JSONB DEFAULT '{}', -- { "min_level": 10, "min_power": 1000 }
				statistics JSONB DEFAULT '{}', -- Clan stats and achievements
				treasury JSONB DEFAULT '{}', -- Clan resources
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				deleted_at TIMESTAMPTZ,
				created_by UUID REFERENCES app.users(id),
				updated_by UUID REFERENCES app.users(id),
				deleted_by UUID REFERENCES app.users(id)
			);

			CREATE INDEX idx_clans_owner_id ON app.clans(owner_id);
			CREATE INDEX idx_clans_clan_name ON app.clans(clan_name);
			CREATE INDEX idx_clans_level ON app.clans(level DESC);

			-- Clan Members: Track clan membership
			CREATE TABLE app.clan_members (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				clan_id UUID NOT NULL REFERENCES app.clans(id) ON DELETE CASCADE,
				user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'elder', 'member'
				joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				contribution_points BIGINT DEFAULT 0,
				last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'banned'
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				UNIQUE(user_id) -- User can only be in one clan
			);

			CREATE INDEX idx_clan_members_clan_id ON app.clan_members(clan_id);
			CREATE INDEX idx_clan_members_user_id ON app.clan_members(user_id);
			CREATE INDEX idx_clan_members_role ON app.clan_members(role);

			-- ===========================================
			-- EVENTS & CHAMPIONSHIPS
			-- ===========================================

			-- Events: Store game events and tournaments
			CREATE TABLE app.events (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				event_code VARCHAR(50) UNIQUE NOT NULL,
				event_name VARCHAR(100) NOT NULL,
				event_type VARCHAR(30) NOT NULL, -- 'tournament', 'championship', 'seasonal', 'daily', 'special'
				description TEXT,
				start_date TIMESTAMPTZ NOT NULL,
				end_date TIMESTAMPTZ,
				registration_start TIMESTAMPTZ,
				registration_end TIMESTAMPTZ,
				max_participants INTEGER,
				current_participants INTEGER DEFAULT 0,
				entry_requirements JSONB DEFAULT '{}', -- { "min_level": 10, "entry_fee": 100 }
				rewards JSONB DEFAULT '{}', -- { "1st": {"coins": 1000}, "participation": {"exp": 50} }
				rules JSONB DEFAULT '{}', -- Event-specific rules
				leaderboard JSONB DEFAULT '[]', -- Current standings
				status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'registration', 'active', 'ended', 'cancelled'
				metadata JSONB DEFAULT '{}',
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				deleted_at TIMESTAMPTZ,
				created_by UUID REFERENCES app.users(id),
				updated_by UUID REFERENCES app.users(id),
				deleted_by UUID REFERENCES app.users(id)
			);

			CREATE INDEX idx_events_event_code ON app.events(event_code);
			CREATE INDEX idx_events_type_status ON app.events(event_type, status);
			CREATE INDEX idx_events_dates ON app.events(start_date, end_date);

			-- Event Participants: Track event participation
			CREATE TABLE app.event_participants (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				event_id UUID NOT NULL REFERENCES app.events(id) ON DELETE CASCADE,
				user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				character_id UUID REFERENCES app.characters(id),
				registration_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				status VARCHAR(20) DEFAULT 'registered', -- 'registered', 'active', 'eliminated', 'completed'
				score BIGINT DEFAULT 0,
				rank INTEGER,
				rewards_claimed BOOLEAN DEFAULT FALSE,
				performance_data JSONB DEFAULT '{}',
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				UNIQUE(event_id, user_id)
			);

			CREATE INDEX idx_event_participants_event_id ON app.event_participants(event_id);
			CREATE INDEX idx_event_participants_user_id ON app.event_participants(user_id);
			CREATE INDEX idx_event_participants_score ON app.event_participants(score DESC);

			-- ===========================================
			-- BLOCKCHAIN INTEGRATION
			-- ===========================================

			-- Blockchain Transactions: Track NFT and token transactions
			CREATE TABLE app.blockchain_transactions (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				wallet_address VARCHAR(42) NOT NULL,
				token_id VARCHAR(64), -- NFT or token ID
				contract_address VARCHAR(42),
				transaction_type VARCHAR(30) NOT NULL, -- 'mint', 'transfer', 'sale', 'purchase', 'stake', 'unstake'
				from_address VARCHAR(42),
				to_address VARCHAR(42),
				amount DECIMAL(18,8),
				gas_fee DECIMAL(18,8),
				blockchain_hash VARCHAR(66) UNIQUE,
				block_number BIGINT,
				status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed', 'cancelled'
				confirmation_count INTEGER DEFAULT 0,
				metadata JSONB DEFAULT '{}',
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
			);

			CREATE INDEX idx_blockchain_transactions_user_id ON app.blockchain_transactions(user_id);
			CREATE INDEX idx_blockchain_transactions_wallet_address ON app.blockchain_transactions(wallet_address);
			CREATE INDEX idx_blockchain_transactions_hash ON app.blockchain_transactions(blockchain_hash);
			CREATE INDEX idx_blockchain_transactions_status ON app.blockchain_transactions(status); 
			-- ===========================================
			-- SYSTEM TABLES
			-- ===========================================

			-- User Sessions: Track active game sessions
			CREATE TABLE app.user_sessions (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				session_token VARCHAR(255) UNIQUE NOT NULL,
				device_info JSONB DEFAULT '{}',
				ip_address INET,
				last_activity TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				expires_at TIMESTAMPTZ NOT NULL,
				status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'terminated'
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
			);

			CREATE INDEX idx_user_sessions_user_id ON app.user_sessions(user_id);
			CREATE INDEX idx_user_sessions_token ON app.user_sessions(session_token);
			CREATE INDEX idx_user_sessions_expires ON app.user_sessions(expires_at);

			-- Notifications: System notifications
			CREATE TABLE app.notifications (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				user_id UUID REFERENCES app.users(id) ON DELETE CASCADE,
				notification_type VARCHAR(30) NOT NULL, -- 'battle_result', 'friend_request', 'clan_invite', 'event'
				title VARCHAR(255) NOT NULL,
				message TEXT NOT NULL,
				data JSONB DEFAULT '{}',
				is_read BOOLEAN DEFAULT FALSE,
				priority VARCHAR(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
				expires_at TIMESTAMPTZ,
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				read_at TIMESTAMPTZ
			);

			CREATE INDEX idx_notifications_user_id ON app.notifications(user_id);
			CREATE INDEX idx_notifications_is_read ON app.notifications(is_read);
			CREATE INDEX idx_notifications_created_at ON app.notifications(created_at DESC);

			-- Game Configuration: Store game settings and constants
			CREATE TABLE app.game_configs (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				config_key VARCHAR(100) UNIQUE NOT NULL,
				config_value JSONB NOT NULL,
				category VARCHAR(50) NOT NULL,
				description TEXT,
				is_active BOOLEAN DEFAULT TRUE,
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				deleted_at TIMESTAMPTZ,
				created_by UUID REFERENCES app.users(id),
				updated_by UUID REFERENCES app.users(id),
				deleted_by UUID REFERENCES app.users(id)
			);

			CREATE INDEX idx_game_configs_key ON app.game_configs(config_key);
			CREATE INDEX idx_game_configs_category ON app.game_configs(category);

			-- Add this to track user ownership across all NFT types
			CREATE TABLE app.user_nfts (
				id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
				user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
				nft_type VARCHAR(20) NOT NULL, -- 'character', 'land', 'item'
				nft_id UUID NOT NULL, -- References app.characters(id), app.user_lands(id), or app.items(id)
				token_id VARCHAR(64), -- Blockchain token ID
				contract_address VARCHAR(42),
				quantity INTEGER DEFAULT 1,
				acquired_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				status VARCHAR(20) DEFAULT 'owned', -- 'owned', 'listed', 'transferred'
				metadata JSONB DEFAULT '{}',
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				UNIQUE(user_id, nft_type, nft_id)
			);

            CREATE INDEX idx_user_nfts_user_id ON app.user_nfts(user_id);
            CREATE INDEX idx_user_nfts_nft_type ON app.user_nfts(nft_type, user_id);


            -- Add wishlist table
            CREATE TABLE app.wishlist_items (
                id UUID DEFAULT uuid_generate_v7() PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
                item_id UUID NOT NULL REFERENCES app.items(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, item_id)
            );

            CREATE INDEX idx_wishlist_items_user_id ON app.wishlist_items(user_id);
            CREATE INDEX idx_wishlist_items_item_id ON app.wishlist_items(item_id);
		`.compile(db),
	);
}

async function createTriggersAndFunctions(db: Kysely<unknown>) {
	await db.executeQuery(
		sql`
			-- Trigger to automatically update the 'updated_at' timestamp
			CREATE OR REPLACE FUNCTION update_timestamp()
			RETURNS TRIGGER AS $$
			BEGIN
				NEW.updated_at = CURRENT_TIMESTAMP;
				RETURN NEW;
			END;
			$$ LANGUAGE plpgsql;

			-- Apply triggers to all tables with updated_at columns
			CREATE TRIGGER update_users_timestamp
				BEFORE UPDATE ON app.users
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_wallets_timestamp
				BEFORE UPDATE ON app.wallets
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_characters_timestamp
				BEFORE UPDATE ON app.characters
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_user_lands_timestamp
				BEFORE UPDATE ON app.user_lands
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

            CREATE TRIGGER update_land_crops_timestamp
                BEFORE UPDATE ON app.land_crops
                FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_friends_timestamp
				BEFORE UPDATE ON app.friends
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_clans_timestamp
				BEFORE UPDATE ON app.clans
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_clan_members_timestamp
				BEFORE UPDATE ON app.clan_members
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_events_timestamp
				BEFORE UPDATE ON app.events
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_event_participants_timestamp
				BEFORE UPDATE ON app.event_participants
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_battle_sessions_timestamp
				BEFORE UPDATE ON app.battle_sessions
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_user_inventories_timestamp
				BEFORE UPDATE ON app.user_inventories
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_items_timestamp
				BEFORE UPDATE ON app.items
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_skill_templates_timestamp
				BEFORE UPDATE ON app.skill_templates
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_character_skills_timestamp
				BEFORE UPDATE ON app.character_skills
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_elemental_affinity_timestamp
				BEFORE UPDATE ON app.elemental_affinity
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_blockchain_transactions_timestamp
				BEFORE UPDATE ON app.blockchain_transactions
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			CREATE TRIGGER update_game_configs_timestamp
				BEFORE UPDATE ON app.game_configs
				FOR EACH ROW EXECUTE FUNCTION update_timestamp();

			-- Function to update clan member count
			CREATE OR REPLACE FUNCTION update_clan_member_count()
			RETURNS TRIGGER AS $$
			BEGIN
				IF TG_OP = 'INSERT' THEN
					UPDATE app.clans
					SET current_members = current_members + 1
					WHERE id = NEW.clan_id;
					RETURN NEW;
				ELSIF TG_OP = 'DELETE' THEN
					UPDATE app.clans
					SET current_members = current_members - 1
					WHERE id = OLD.clan_id;
					RETURN OLD;
				END IF;
				RETURN NULL;
			END;
			$$ LANGUAGE plpgsql;

			CREATE TRIGGER clan_member_count_trigger
				AFTER INSERT OR DELETE ON app.clan_members
				FOR EACH ROW EXECUTE FUNCTION update_clan_member_count();

			-- Function to update event participant count
			CREATE OR REPLACE FUNCTION update_event_participant_count()
			RETURNS TRIGGER AS $$
			BEGIN
				IF TG_OP = 'INSERT' THEN
					UPDATE app.events
					SET current_participants = current_participants + 1
					WHERE id = NEW.event_id;
					RETURN NEW;
				ELSIF TG_OP = 'DELETE' THEN
					UPDATE app.events
					SET current_participants = current_participants - 1
					WHERE id = OLD.event_id;
					RETURN OLD;
				END IF;
				RETURN NULL;
			END;
			$$ LANGUAGE plpgsql;

			CREATE TRIGGER event_participant_count_trigger
				AFTER INSERT OR DELETE ON app.event_participants
				FOR EACH ROW EXECUTE FUNCTION update_event_participant_count();

		`.compile(db),
	);
}

async function insertInitialData(db: Kysely<unknown>) {
	// Create the first admin user
	const adminUser = {
		id: '00000000-0000-0000-0000-000000000001',
		username: 'game_admin',
		email: 'admin@cwgame.com',
		password_hash:
			'$2b$10$gKnHCf2mI1lyM4kM5VyuAO/0m6UqxexlHWyEYuwN/SQGKZvahu1sm', // GameAdmin@123
		wallet_address: '0x0000000000000000000000000000000000000000',
		display_name: 'Game Administrator',
		level: 100,
		experience_points: 999_999,
		referral_code: 'ADMIN001',
		account_status: 'active',
		account_verified_at: new Date(),
		lang_tag: 'en',
		location: 'Vietnam',
		timezone: 'Asia/Ho_Chi_Minh',
		metadata: {
			description: 'Game Administrator',
		},
		user_type: 'admin',
	};

	await db
		.withSchema('app')
		.insertInto('users' as never)
		.values(adminUser)
		.execute();

	console.info('\t + Inserted admin user');

	console.info('[Done] Game database schema created with initial data');
}

export async function up(database: Kysely<unknown>): Promise<void> {
	console.info('Creating game database schema');

	console.info('Executing uuid_generate_v7');
	await createUUIDv7Function(database);

	console.info('Executing Database Schema');
	await createDatabaseSchema(database);

	console.info('Creating Triggers and Functions');
	await createTriggersAndFunctions(database);

	console.info('Inserting initial data');
	await insertInitialData(database);

	console.info('Game database schema created successfully');
}

export async function down(database: Kysely<unknown>): Promise<void> {
	// Drop all schemas and tables
	await database.executeQuery(
		sql`DROP SCHEMA IF EXISTS app CASCADE`.compile(database),
	);
	await database.executeQuery(
		sql`DROP SCHEMA IF EXISTS public CASCADE`.compile(database),
	);
	console.info('Game database schema dropped');
}
