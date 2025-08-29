# Egg System API Documentation

## Overview

The Crickets World API implements a sophisticated egg system with two main generations: **GEN1** and **GEN2** eggs. This system serves as the core mechanism for character acquisition and progression in the game.

## System Architecture

### Database Tables

1. **egg_crafting_history** - Tracks all egg crafting attempts
2. **egg_open_history** - Tracks all egg opening attempts
3. **game_config** - Stores dynamic configuration for the egg system

### Key Components

- **Egg System Use Case** (`src/modules/cwgame/egg-system.use-case.ts`)
- **Egg System Controller** (`src/modules/cwgame/egg-system.controller.ts`)
- **CMS Controller** (`src/modules/cms/egg-system-cms.controller.ts`)
- **Database Entities** (`src/core/entities/egg-system.entity.ts`)

## Egg Types & Hierarchy

### 1. GEN1 Egg System (Crafting-Based)

**GEN1** represents egg fragments that players collect and craft into complete **GEN1_EGG** items.

#### Key Components

- **GEN1_EGG_PIECE**: Egg fragments (crafting material)
- **GEN1_EGG**: Complete egg created from fragments
- **LUCKY_LEAF**: Optional item to improve crafting success rate

#### Crafting Process

1. **Fragment Collection**: Players gather GEN1_EGG_PIECE fragments through gameplay
2. **Crafting Attempt**: Combine fragments to create a GEN1_EGG
3. **Success/Failure Logic**: Probability-based crafting with optional lucky leaf boost

### 2. GEN2 Egg System (Direct Opening)

**GEN2** represents premium eggs that can be opened directly to obtain characters.

## API Endpoints

### gRPC Endpoints (EggService)

#### Get Egg Crafting Fee

```protobuf
rpc GetEggCraftingFee(GetEggCraftingFeeRequest) returns (GetEggCraftingFeeResponse)
```

**Request:**

```json
{
  "user_id": "string"
}
```

**Response:**

```json
{
  "data": {
    "crafting_fee": 50,
    "required_fragments": 100,
    "success_rate": 30,
    "fragments_lost_on_failure": 50,
    "lucky_leaf_boost": 20,
    "lucky_leaf_required": 1
  }
}
```

#### Craft Egg

```protobuf
rpc CraftEgg(CraftEggRequest) returns (CraftEggResponse)
```

**Request:**

```json
{
  "user_id": "string",
  "fragment_quantity": 100,
  "lucky_leaf_item_id": "optional-string",
  "lucky_leaf_quantity": 1
}
```

**Response:**

```json
{
  "data": {
    "success": true,
    "crafted_egg_id": "string",
    "crafted_egg_quantity": 1,
    "fragments_used": 100,
    "lucky_leaves_used": 1,
    "crafting_fee": 50,
    "wallet_balance_after": 950,
    "message": "Successfully crafted GEN1 egg!"
  }
}
```

#### Get Egg Opening Fee

```protobuf
rpc GetEggOpeningFee(GetEggOpeningFeeRequest) returns (GetEggOpeningFeeResponse)
```

**Request:**

```json
{
  "user_id": "string",
  "egg_type": "gen2"
}
```

**Response:**

```json
{
  "data": {
    "opening_fee": 5,
    "egg_type": "gen2",
    "description": "Opening fee for GEN2 egg"
  }
}
```

#### Open Egg

```protobuf
rpc OpenEgg(OpenEggRequest) returns (OpenEggResponse)
```

**Request:**

```json
{
  "user_id": "string",
  "egg_item_id": "string",
  "egg_type": "gen2"
}
```

**Response:**

```json
{
  "data": {
    "success": true,
    "character_id": "string",
    "character": {
      "id": "string",
      "character_name": "Warrior_ABC123",
      "character_class": "warrior",
      "rarity": "rare",
      "level": 1,
      "base_stats": {
        "attack": 25,
        "defend": 15,
        "speed": 12,
        "hp": 275,
        "lifetime": 3
      }
    },
    "opening_fee": 5,
    "wallet_balance_after": 45,
    "message": "Successfully opened GEN2 egg and got character!"
  }
}
```

### CMS Endpoints (Admin)

#### Get Egg System Configuration

```
GET /cms/egg-system/config
```

**Response:**

```json
{
  "config": {
    "gen1FragmentRequired": 100,
    "gen1CraftingSuccessRate": 30,
    "gen1CraftingFee": 50,
    "gen1FragmentLostOnFailure": 50,
    "gen2OpeningFee": 5,
    "luckyLeafQuantityRequired": 1,
    "luckyLeafSuccessRateBoost": 20,
    "characterStatRanges": {
      "attack": { "min": 10, "max": 50 },
      "defend": { "min": 5, "max": 30 },
      "speed": { "min": 8, "max": 25 }
    },
    "characterLifetimeRanges": {
      "min": 1,
      "max": 6
    },
    "characterDropRates": {
      "gen1": {
        "warrior": 25,
        "mage": 25,
        "archer": 25,
        "rogue": 25
      },
      "gen2": {
        "warrior": 25,
        "mage": 25,
        "archer": 25,
        "rogue": 25
      }
    },
    "eggNullMiniRate": 10,
    "eggNullCwRate": 5
  },
  "message": "Egg system configuration retrieved successfully"
}
```

#### Update Egg System Configuration

```
PUT /cms/egg-system/config
```

**Request Body:**

```json
{
  "gen1CraftingSuccessRate": 35,
  "gen1CraftingFee": 60,
  "characterStatRanges": {
    "attack": { "min": 15, "max": 55 },
    "defend": { "min": 8, "max": 35 },
    "speed": { "min": 10, "max": 30 }
  }
}
```

#### Get Egg System Statistics

```
GET /cms/egg-system/stats
```

**Response:**

```json
{
  "totalCraftingAttempts": 1000,
  "successfulCraftingAttempts": 320,
  "failedCraftingAttempts": 680,
  "craftingSuccessRate": 32.0,
  "totalOpeningAttempts": 500,
  "successfulOpeningAttempts": 500,
  "failedOpeningAttempts": 0,
  "openingSuccessRate": 100.0,
  "totalFragmentsUsed": 85000,
  "totalLuckyLeavesUsed": 150,
  "totalCraftingFees": 50000,
  "totalOpeningFees": 2500
}
```

#### Reset Configuration to Defaults

```
POST /cms/egg-system/reset-config
```

## Configuration System

The egg system uses the existing `game_config` table for dynamic configuration. All settings can be updated through the CMS interface without code changes.

### Configuration Keys

- `egg_gen1_fragment_required` - Number of fragments needed for crafting
- `egg_gen1_crafting_success_rate` - Success rate percentage (0-100)
- `egg_gen1_crafting_fee` - Fee in coins for crafting
- `egg_gen1_fragment_lost_on_failure` - Fragments lost on failure
- `egg_gen2_opening_fee` - Fee for opening GEN2 eggs
- `egg_lucky_leaf_item_id` - Lucky leaf item ID
- `egg_lucky_leaf_quantity_required` - Lucky leaves needed
- `egg_lucky_leaf_success_rate_boost` - Success rate boost percentage
- `egg_character_stat_ranges` - Character stat generation ranges
- `egg_character_lifetime_ranges` - Character lifetime ranges
- `egg_character_drop_rates` - Character class drop rates
<!-- - `egg_null_cw_rate` - CW item drop rate -->

## Character Generation

### Stat Calculation

Character stats are generated randomly within configured ranges:

- **Attack**: Random value between min-max
- **Defend**: Random value between min-max  
- **Speed**: Random value between min-max
- **HP**: Calculated using formula `(defend * 2 + attack + speed) * 5`
- **Lifetime**: Random months between min-max

### Character Classes

- **Warrior**: Balanced stats, good for melee combat
- **Mage**: High attack, low defense, good for magic
- **Archer**: High speed, good for ranged combat
- **Rogue**: High speed and attack, low defense

### Rarity Distribution

- **Common**: 50% chance
- **Uncommon**: 30% chance
- **Rare**: 15% chance
- **Epic**: 4% chance
- **Legendary**: 1% chance

## Lucky Leaf System

The lucky leaf provides protection during crafting:

- **Effect**: Increases success rate by configured percentage
- **Protection**: When used, failed attempts don't consume fragments
- **Requirement**: Must have sufficient lucky leaves in inventory

## Fee System

- **Crafting Fee**: Deducted from game wallet only
- **Opening Fee**: Only applies to GEN2 eggs (GEN1 eggs are free to open)
- **Validation**: System checks wallet balance before processing

## Database Schema

### egg_crafting_history

```sql
CREATE TABLE app.egg_crafting_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES app.users(id),
  egg_type VARCHAR(10) NOT NULL,
  fragment_item_id UUID NOT NULL REFERENCES app.items(id),
  fragment_quantity INTEGER NOT NULL,
  lucky_leaf_item_id UUID REFERENCES app.items(id),
  lucky_leaf_quantity INTEGER,
  status VARCHAR(10) NOT NULL,
  crafted_egg_id UUID REFERENCES app.items(id),
  crafted_egg_quantity INTEGER,
  crafting_fee DECIMAL(18,8) NOT NULL,
  wallet_balance_before DECIMAL(18,8) NOT NULL,
  wallet_balance_after DECIMAL(18,8) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- ... audit fields
);
```

### egg_open_history

```sql
CREATE TABLE app.egg_open_history (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES app.users(id),
  egg_item_id UUID NOT NULL REFERENCES app.items(id),
  egg_type VARCHAR(10) NOT NULL,
  status VARCHAR(10) NOT NULL,
  character_id UUID REFERENCES app.characters(id),
  character_name VARCHAR(100),
  character_class VARCHAR(50),
  character_rarity VARCHAR(20),
  character_stats JSONB,
  opening_fee DECIMAL(18,8) NOT NULL,
  wallet_balance_before DECIMAL(18,8) NOT NULL,
  wallet_balance_after DECIMAL(18,8) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- ... audit fields
);
```

## Error Handling

The system provides comprehensive error handling:

- **Insufficient Fragments**: When user doesn't have enough fragments
- **Insufficient Lucky Leaves**: When lucky leaf is provided but not available
- **Insufficient Wallet Balance**: When user can't afford fees
- **Invalid Items**: When egg or fragment items don't exist
- **Invalid Egg Type**: When egg type doesn't match item

## Security

- **User Validation**: All endpoints validate user ownership
- **Transaction Safety**: All operations use database transactions
- **Audit Trail**: All actions are logged with user and timestamp
- **Admin Access**: CMS endpoints require admin privileges

## Testing

The system includes comprehensive testing:

- **Unit Tests**: For use case logic
- **Integration Tests**: For database operations
- **API Tests**: For endpoint functionality
- **Configuration Tests**: For dynamic settings

## Deployment

1. **Run Migration**: Execute the egg system migration
2. **Seed Configuration**: Run the configuration seed
3. **Update Modules**: Ensure modules include new components
4. **Test Endpoints**: Verify all endpoints work correctly

## Future Enhancements

- **Marketplace Integration**: Allow trading of crafted eggs
- **Advanced Statistics**: More detailed analytics
- **Event System**: Special egg events with boosted rates
- **Achievement System**: Rewards for crafting milestones
