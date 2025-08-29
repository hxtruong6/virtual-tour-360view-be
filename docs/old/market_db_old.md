Key Features of the Schema:
Core Tables:
users - User accounts with authentication, profile info, and wallet addresses
wallets - User wallet balances and coin types
brands - NFT brand/collection information
nfts - NFT tokens with metadata, ownership, and pricing
orders & order_details - Purchase order management
auctions & auction_bids - Auction system for NFTs
reviews - User reviews for brands/NFTs
Content Management:
categories & blogs - Blog system
videos - Video content management
Trading & Transactions:
packages & purchase_token - Token purchase system
transactions - Wallet transaction history
users_nfts - User NFT ownership tracking
favorites - User favorite NFTs
Communication:
chat_conversations & messages - Chat system between users
System:
system_nft_inventories - System inventory tracking
configs - System configuration settings
Schema Features:
✅ UUID Primary Keys - All tables use UUID primary keys with auto-generation
✅ Foreign Key Constraints - Proper referential integrity
✅ Indexes - Performance-optimized indexes on frequently queried columns
✅ Timestamps - Created/updated timestamps on all tables
✅ Soft Deletes - Deleted_at columns where applicable
✅ Comments - Table descriptions for documentation
✅ Data Types - Appropriate PostgreSQL data types
✅ Constraints - Unique constraints, NOT NULL, defaults
