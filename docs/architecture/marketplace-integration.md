# Marketplace Architecture & Integration

## Overview

The marketplace system is designed as a **separate schema** (`marketplace.*`) that handles NFT trading of game assets while maintaining clean separation from core game logic (`app.*`). This approach provides several architectural benefits:

## 🏗️ **Schema Separation Benefits**

### 1. **Domain Separation**

- **Game Logic**: Character progression, battles, farming mechanics
- **Marketplace Logic**: Trading, auctions, price discovery, reviews

### 2. **Independent Scaling**

- Marketplace might have different read/write patterns
- Can optimize each schema independently
- Different caching strategies

### 3. **Security Boundaries**

- Different access patterns and permissions
- Marketplace operations don't affect game state directly
- Easier to audit financial transactions

### 4. **Team Organization**

- Game team focuses on `app.*` schema
- Marketplace team focuses on `marketplace.*` schema
- Clear ownership boundaries

## 📊 **Schema Relationship Pattern**

```
┌─────────────────┐    ┌──────────────────────┐
│   Game Schema   │    │  Marketplace Schema  │
│    (app.*)      │    │  (marketplace.*)     │
├─────────────────┤    ├──────────────────────┤
│ • users         │◄──►│ • listings           │
│ • characters    │    │ • bids               │
│ • user_lands    │    │ • transactions       │
│ • user_inventory│    │ • price_history      │
│ • wallets       │    │ • reviews            │
└─────────────────┘    └──────────────────────┘
```

### Key Integration Points

1. **User References**: Marketplace tables reference `app.users.id` (no FK constraints for flexibility)
2. **Asset References**: Marketplace tracks `asset_id` pointing to game assets
3. **Wallet Integration**: Both schemas can interact with `app.wallets`

## 🔄 **Data Flow Patterns**

### Character Trading Flow

```typescript
// 1. User lists character for sale
app.characters → marketplace.listings
    ↓
// 2. Asset status changes in game
UPDATE app.characters SET status = 'listed'

// 3. Sale completes
marketplace.transactions → app.blockchain_transactions
    ↓
// 4. Ownership transfer
UPDATE app.characters SET user_id = new_owner_id, status = 'owned'
```

### Land Trading Flow

```typescript
// 1. User lists land for sale
app.user_lands → marketplace.listings
    ↓
// 2. Land becomes non-farmable during sale
UPDATE app.user_lands SET status = 'listed'

// 3. Sale completes
marketplace.transactions → app.blockchain_transactions
    ↓
// 4. Ownership transfer
UPDATE app.user_lands SET user_id = new_owner_id, status = 'owned'
```

## 🛠️ **Implementation Patterns**

### 1. **Cross-Schema Services**

```typescript
// Game Service Layer
@Injectable()
export class CharacterService {
  async listCharacterForSale(characterId: string, price: number) {
    // 1. Validate character ownership (game schema)
    const character = await this.gameRepository.getCharacter(characterId);
    
    // 2. Create marketplace listing (marketplace schema)
    const listing = await this.marketplaceService.createListing({
      asset_type: 'character',
      asset_id: characterId,
      price,
      seller_id: character.user_id
    });
    
    // 3. Update character status (game schema)
    await this.gameRepository.updateCharacter(characterId, { 
      status: 'listed' 
    });
    
    return listing;
  }
}
```

### 2. **Event-Driven Integration**

```typescript
// Domain Events for cross-schema communication
export class MarketplaceSaleCompletedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly assetType: 'character' | 'land' | 'item',
    public readonly assetId: string,
    public readonly fromUserId: string,
    public readonly toUserId: string,
  ) {}
}

// Event Handler in Game Service
@EventsHandler(MarketplaceSaleCompletedEvent)
export class AssetOwnershipHandler {
  async handle(event: MarketplaceSaleCompletedEvent) {
    switch (event.assetType) {
      case 'character':
        await this.transferCharacterOwnership(
          event.assetId, 
          event.toUserId
        );
        break;
      case 'land':
        await this.transferLandOwnership(
          event.assetId, 
          event.toUserId
        );
        break;
    }
  }
}
```

### 3. **Repository Pattern**

```typescript
// Separate repositories for each schema
export class GameRepository {
  constructor(private db: Database) {}
  
  async getCharacter(id: string) {
    return this.db
      .withSchema('app')
      .selectFrom('characters')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }
}

export class MarketplaceRepository {
  constructor(private db: Database) {}
  
  async createListing(listing: CreateListingDto) {
    return this.db
      .withSchema('marketplace')
      .insertInto('listings')
      .values(listing)
      .returningAll()
      .executeTakeFirst();
  }
}
```

## 🔐 **Security Considerations**

### 1. **Asset Verification**

```typescript
// Always verify game asset ownership before marketplace operations
async verifyAssetOwnership(userId: string, assetType: string, assetId: string) {
  const query = this.db.withSchema('app');
  
  switch (assetType) {
    case 'character':
      return query.selectFrom('characters')
        .where('id', '=', assetId)
        .where('user_id', '=', userId)
        .where('status', '=', 'owned')
        .executeTakeFirst();
    case 'land':
      return query.selectFrom('user_lands')
        .where('id', '=', assetId)
        .where('user_id', '=', userId)
        .where('status', '=', 'owned')
        .executeTakeFirst();
  }
}
```

### 2. **Transaction Atomicity**

```typescript
// Use database transactions for cross-schema operations
async completeSale(transactionId: string) {
  return this.db.transaction().execute(async (trx) => {
    // 1. Update marketplace transaction
    await trx.withSchema('marketplace')
      .updateTable('transactions')
      .set({ payment_status: 'completed' })
      .where('id', '=', transactionId)
      .execute();
    
    // 2. Transfer asset ownership
    await trx.withSchema('app')
      .updateTable('characters')
      .set({ 
        user_id: newOwnerId,
        status: 'owned',
        updated_at: new Date()
      })
      .where('id', '=', assetId)
      .execute();
  });
}
```

## 📈 **Analytics & Reporting**

### Cross-Schema Analytics

```sql
-- Example: Character trading volume by rarity
SELECT 
  c.rarity,
  COUNT(mt.id) as sales_count,
  AVG(mt.sale_price) as avg_price,
  SUM(mt.sale_price) as total_volume
FROM marketplace.transactions mt
JOIN app.characters c ON mt.asset_id = c.id
WHERE mt.asset_type = 'character'
  AND mt.payment_status = 'completed'
  AND mt.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY c.rarity
ORDER BY total_volume DESC;
```

## 🚀 **Deployment Strategies**

### 1. **Monolithic Deployment** (Current)

- Both schemas in same PostgreSQL instance
- Single application handles both domains
- Shared connection pool

### 2. **Service Separation** (Future)

- Game service manages `app.*` schema
- Marketplace service manages `marketplace.*` schema
- Event-driven communication between services

### 3. **Database Separation** (Future)

- Separate PostgreSQL instances
- Game database: `app.*` schema
- Marketplace database: `marketplace.*` schema
- API-based integration

## 📋 **Best Practices**

### 1. **No Foreign Key Constraints Between Schemas**

- Use application-level referential integrity
- Prevents schema coupling
- Easier to separate later

### 2. **Event-Driven Updates**

- Use domain events for cross-schema communication
- Ensures loose coupling
- Easier testing and debugging

### 3. **Consistent Asset Status**

- Always update asset status in game schema
- Prevent double-listing of assets
- Clear ownership state

### 4. **Audit Trail**

- `marketplace.price_history` tracks all price changes
- `marketplace.transactions` provides complete sales history
- Both schemas maintain audit fields

## 🔄 **Migration Path to Microservices**

When ready to split into separate services:

1. **Phase 1**: Separate application layers (same database)
2. **Phase 2**: Separate databases with API integration
3. **Phase 3**: Independent deployments and scaling

The current schema design supports this evolution without major restructuring.

## 📊 **Monitoring & Metrics**

### Key Metrics to Track

- **Game Metrics**: Active users, character progression, farming activity
- **Marketplace Metrics**: Listing volume, sales volume, price trends
- **Cross-Domain Metrics**: Asset liquidity, trading velocity

### Suggested Dashboards

- Game health dashboard (`app.*` schema metrics)
- Marketplace performance dashboard (`marketplace.*` schema metrics)
- Asset economy dashboard (cross-schema analytics)
