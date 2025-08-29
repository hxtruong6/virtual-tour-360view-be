-- CWorld NFT Marketplace Database Schema
-- Generated from TypeORM entities

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sequence for user numbers
CREATE SEQUENCE IF NOT EXISTS user_no_seq;

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    no INTEGER DEFAULT nextval('user_no_seq'::regclass),
    username VARCHAR UNIQUE,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    phone VARCHAR,
    dialcode VARCHAR,
    wallet_address VARCHAR,
    gamefi_account VARCHAR,
    provider VARCHAR,
    address VARCHAR NOT NULL,
    avatar VARCHAR,
    type INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    is_super_admin BOOLEAN DEFAULT FALSE,
    is_lock INTEGER DEFAULT 0
);

-- ========================================
-- WALLETS TABLE
-- ========================================
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    coin_type VARCHAR NOT NULL,
    provider VARCHAR NOT NULL,
    balance FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- BRANDS TABLE
-- ========================================
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR UNIQUE NOT NULL,
    contract VARCHAR UNIQUE NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    logo VARCHAR NOT NULL,
    banner VARCHAR,
    slogan VARCHAR,
    description TEXT,
    default_pool_share INTEGER,
    owner_id UUID NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- CATEGORIES TABLE
-- ========================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- BLOGS TABLE
-- ========================================
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    category_id UUID NOT NULL,
    content TEXT NOT NULL,
    author UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- NFTS TABLE
-- ========================================
CREATE TABLE nfts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    token_id INTEGER NOT NULL,
    quantity INTEGER,
    contract VARCHAR NOT NULL,
    slug VARCHAR,
    no INTEGER NOT NULL,
    brand_id UUID,
    brand_contract VARCHAR NOT NULL,
    type INTEGER NOT NULL COMMENT 'Brand NFT | GameFi NFT',
    gamefi_type INTEGER COMMENT 'GameFi Type',
    status VARCHAR NOT NULL,
    price FLOAT,
    pool_share INTEGER,
    image VARCHAR NOT NULL,
    images TEXT,
    token_uri VARCHAR,
    description TEXT,
    content TEXT,
    owner_id UUID,
    owner_wallet_address VARCHAR,
    minter_id UUID NOT NULL,
    favorite_count INTEGER DEFAULT 0,
    level INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================
-- ORDERS TABLE
-- ========================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL,
    buyer_wallet_address VARCHAR NOT NULL,
    need_physical BOOLEAN NOT NULL,
    address VARCHAR,
    phone VARCHAR,
    payment_status VARCHAR DEFAULT 'paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- ORDER_DETAILS TABLE
-- ========================================
CREATE TABLE order_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    nft_id UUID NOT NULL,
    token_id INTEGER NOT NULL,
    brand_token_ids VARCHAR,
    seller_id UUID NOT NULL,
    seller_wallet_address VARCHAR NOT NULL,
    price FLOAT NOT NULL,
    quantity INTEGER,
    pool_share INTEGER,
    status INTEGER DEFAULT 0,
    is_shipped BOOLEAN DEFAULT FALSE,
    payment_status VARCHAR DEFAULT 'paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (nft_id) REFERENCES nfts(id) ON DELETE CASCADE
);

-- ========================================
-- AUCTIONS TABLE
-- ========================================
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_token_id INTEGER NOT NULL,
    nft_id UUID NOT NULL,
    token_id INTEGER NOT NULL,
    contract VARCHAR NOT NULL,
    gamefi_type INTEGER COMMENT 'GameFi Type',
    seller_id UUID NOT NULL,
    start_price FLOAT NOT NULL,
    current_price FLOAT,
    status INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    winner_id UUID,
    winner_price FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nft_id) REFERENCES nfts(id) ON DELETE CASCADE
);

-- ========================================
-- AUCTION_BIDS TABLE
-- ========================================
CREATE TABLE auction_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL,
    auction_token_id INTEGER NOT NULL,
    bidder_id UUID NOT NULL,
    bidder_address VARCHAR NOT NULL,
    amount FLOAT NOT NULL,
    is_winner BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- REVIEWS TABLE
-- ========================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL,
    nft_id VARCHAR NOT NULL,
    content TEXT NOT NULL,
    rate INTEGER NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- PACKAGES TABLE
-- ========================================
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR UNIQUE NOT NULL,
    token_value INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    image VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- ========================================
-- PURCHASE_TOKEN TABLE
-- ========================================
CREATE TABLE purchase_token (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR NOT NULL,
    package_id VARCHAR NOT NULL,
    transaction_hash VARCHAR UNIQUE NOT NULL,
    token_value DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR NOT NULL,
    purchase_date TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TRANSACTIONS TABLE
-- ========================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id VARCHAR NOT NULL,
    user_id VARCHAR NOT NULL,
    type VARCHAR,
    transaction_hash VARCHAR NOT NULL,
    amount FLOAT NOT NULL,
    from_address VARCHAR,
    to_address VARCHAR,
    block_number INTEGER,
    gas_price INTEGER,
    gas_used INTEGER,
    status VARCHAR NOT NULL,
    status_message VARCHAR,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- USERS_NFTS TABLE
-- ========================================
CREATE TABLE users_nfts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id VARCHAR NOT NULL,
    nft_id VARCHAR NOT NULL,
    contract VARCHAR NOT NULL,
    contract_address VARCHAR,
    brand_id VARCHAR,
    status VARCHAR,
    own_total_quantity INTEGER DEFAULT 1,
    brand_token_ids VARCHAR,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- ========================================
-- FAVORITES TABLE
-- ========================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR NOT NULL,
    nft_id VARCHAR NOT NULL,
    contract VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL
);

-- ========================================
-- CHAT_CONVERSATIONS TABLE
-- ========================================
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id VARCHAR NOT NULL,
    buyer_id VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- MESSAGES TABLE
-- ========================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    content TEXT NOT NULL,
    order_id VARCHAR,
    order_item_id VARCHAR,
    from_user VARCHAR NOT NULL,
    is_read BOOLEAN,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- VIDEOS TABLE
-- ========================================
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    path VARCHAR NOT NULL,
    thumbnail VARCHAR NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- SYSTEM_NFT_INVENTORIES TABLE
-- ========================================
CREATE TABLE system_nft_inventories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract VARCHAR NOT NULL,
    value INTEGER NOT NULL,
    type VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- CONFIGS TABLE
-- ========================================
CREATE TABLE configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    value VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- NFTs indexes
CREATE INDEX idx_nfts_token_id ON nfts(token_id);
CREATE INDEX idx_nfts_contract ON nfts(contract);
CREATE INDEX idx_nfts_brand_id ON nfts(brand_id);
CREATE INDEX idx_nfts_owner_id ON nfts(owner_id);
CREATE INDEX idx_nfts_type ON nfts(type);
CREATE INDEX idx_nfts_status ON nfts(status);
CREATE INDEX idx_nfts_deleted_at ON nfts(deleted_at);

-- Orders indexes
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order details indexes
CREATE INDEX idx_order_details_order_id ON order_details(order_id);
CREATE INDEX idx_order_details_nft_id ON order_details(nft_id);

-- Auctions indexes
CREATE INDEX idx_auctions_nft_id ON auctions(nft_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_end_time ON auctions(end_time);

-- Auction bids indexes
CREATE INDEX idx_auction_bids_auction_id ON auction_bids(auction_id);
CREATE INDEX idx_auction_bids_bidder_id ON auction_bids(bidder_id);

-- Reviews indexes
CREATE INDEX idx_reviews_brand_id ON reviews(brand_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_transaction_hash ON transactions(transaction_hash);

-- Favorites indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_nft_id ON favorites(nft_id);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE users IS 'User accounts and profiles';
COMMENT ON TABLE wallets IS 'User wallet information and balances';
COMMENT ON TABLE brands IS 'NFT brand/collection information';
COMMENT ON TABLE categories IS 'Blog categories';
COMMENT ON TABLE blogs IS 'Blog posts and articles';
COMMENT ON TABLE nfts IS 'NFT tokens and metadata';
COMMENT ON TABLE orders IS 'Purchase orders';
COMMENT ON TABLE order_details IS 'Individual items in orders';
COMMENT ON TABLE auctions IS 'NFT auction information';
COMMENT ON TABLE auction_bids IS 'Bids placed on auctions';
COMMENT ON TABLE reviews IS 'User reviews for brands/NFTs';
COMMENT ON TABLE packages IS 'Token purchase packages';
COMMENT ON TABLE purchase_token IS 'Token purchase transactions';
COMMENT ON TABLE transactions IS 'Wallet transaction history';
COMMENT ON TABLE users_nfts IS 'User NFT ownership tracking';
COMMENT ON TABLE favorites IS 'User favorite NFTs';
COMMENT ON TABLE chat_conversations IS 'Chat conversations between users';
COMMENT ON TABLE messages IS 'Chat messages';
COMMENT ON TABLE videos IS 'Video content';
COMMENT ON TABLE system_nft_inventories IS 'System NFT inventory tracking';
COMMENT ON TABLE configs IS 'System configuration settings'; 