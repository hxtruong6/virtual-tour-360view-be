# NFT Marketplace API Design v1.0

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [User Management](#2-user-management)
3. [NFT Management](#3-nft-management)
4. [Auction System](#4-auction-system)
5. [Wallet & Transactions](#5-wallet--transactions)
6. [Content Management](#6-content-management)
7. [Analytics & Monitoring](#7-analytics--monitoring)
8. [Error Handling](#8-error-handling)
9. [Rate Limiting](#9-rate-limiting)

---

## 1. Authentication & Authorization

### Base URL

```
https://api.cwgame.com/api/v1/market
```

### Standard Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Authentication Endpoints

#### `POST /api/v1/market/auth/register`

**Description**: Register a new user account

**Request Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "username": "string (3-50 chars, alphanumeric + underscore)",
  "email": "string (valid email format)",
  "password": "string (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)",
  "walletAddress": "string (optional, blockchain wallet address)",
  "referralCode": "string (optional)"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "Klink CW",
      "email": "user@example.com",
      "walletAddress": "0x1234...abcd",
      "isEmailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "User registered successfully. Please verify your email."
  },
  "meta": {
    "requiresEmailVerification": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/v1/market/auth/login`

**Description**: Authenticate user and get access tokens

**Request Body**:

```json
{
  "email": "string",
  "password": "string"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "username": "Klink CW",
      "email": "user@example.com",
      "walletAddress": "0x1234...abcd",
      "isEmailVerified": true,
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/v1/market/auth/refresh`

**Description**: Refresh access token using refresh token

**Request Headers**:

```
Authorization: Bearer <refresh_token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/v1/market/auth/logout`

**Description**: Logout user and invalidate tokens

**Request Headers**:

```
Authorization: Bearer <access_token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/v1/market/auth/forgot-password`

**Description**: Request password reset

**Request Body**:

```json
{
  "email": "string"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/v1/market/auth/reset-password`

**Description**: Reset password using token

**Request Body**:

```json
{
  "token": "string",
  "newPassword": "string (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)"
}
```

---

## 2. User Management

### User Profile Endpoints

#### `GET /api/v1/market/users/profile`

**Description**: Get current user profile

**Request Headers**:

```
Authorization: Bearer <access_token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "Klink CW",
      "email": "user@example.com",
      "walletAddress": "0x1234...abcd",
      "phone": "+1234567890",
      "fullName": "Klink CW",
      "avatar": "https://example.com/avatar.jpg",
      "isEmailVerified": true,
      "isPhoneVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "wallet": {
      "balance": {
        "amount": 3893.345,
        "currency": "CW",
        "decimals": 6
      },
      "totalValue": {
        "amount": 15000.50,
        "currency": "USD"
      }
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `PUT /api/v1/market/users/profile`

**Description**: Update user profile

**Request Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "fullName": "string (optional)",
  "phone": "string (optional, international format)",
  "avatar": "string (optional, base64 or URL)"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "Klink CW",
      "email": "user@example.com",
      "fullName": "Updated Name",
      "phone": "+1234567890",
      "avatar": "https://example.com/avatar.jpg",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Profile updated successfully"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/v1/market/users/inventory`

**Description**: Get user's NFT collection

**Request Headers**:

```
Authorization: Bearer <access_token>
```

**Query Parameters**:

```
type: string (character|land|item, optional)
rarity: string (common|uncommon|rare|epic|legendary, optional)
page: number (default: 1)
limit: number (default: 20, max: 100)
sortBy: string (createdAt|level|exp|rarity, default: createdAt)
order: string (asc|desc, default: desc)
```

**Response**:

```json
{
  "success": true,
  "data": {
    "nfts": [
      {
        "id": "uuid",
        "tokenId": "NFT-765",
        "contractAddress": "0x1234...abcd",
        "type": "character",
        "category": "Warrior",
        "rarity": "rare",
        "level": 7,
        "exp": 9942,
        "metadata": {
          "name": "Dragon Warrior",
          "description": "A powerful warrior with dragon abilities",
          "imageUrl": "https://example.com/nft.jpg",
          "attributes": [
            {
              "trait_type": "Strength",
              "value": 85
            }
          ]
        },
        "stats": {
          "strength": 37,
          "speed": 246,
          "health": 2534,
          "defense": 6457
        },
        "acquiredAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "applied": ["type", "rarity"],
      "available": ["type", "rarity", "level", "exp"]
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/v1/market/users/listed-items`

**Description**: Get user's items listed for sale

**Request Headers**:

```
Authorization: Bearer <access_token>
```

**Query Parameters**:

```
status: string (active|sold|cancelled, optional)
page: number (default: 1)
limit: number (default: 20, max: 100)
```

**Response**:

```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "uuid",
        "nftId": "uuid",
        "tokenId": "NFT-765",
        "type": "character",
        "price": {
          "amount": 2935.50,
          "currency": "CW",
          "decimals": 6
        },
        "status": "active",
        "listedAt": "2024-01-01T00:00:00.000Z",
        "expiresAt": "2024-02-01T00:00:00.000Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 3. NFT Management

### NFT Marketplace Endpoints

#### `GET /api/v1/market/nfts`

**Description**: Get NFTs available in marketplace with filtering

**Query Parameters**:

```
type: string (character|land|item, optional)
category: string (optional)
rarity: string (common|uncommon|rare|epic|legendary, optional)
minPrice: number (optional)
maxPrice: number (optional)
minLevel: number (optional)
maxLevel: number (optional)
sortBy: string (price|level|exp|createdAt, default: createdAt)
order: string (asc|desc, default: desc)
page: number (default: 1)
limit: number (default: 20, max: 100)
```

**Response**:

```json
{
  "success": true,
  "data": {
    "nfts": [
      {
        "id": "uuid",
        "tokenId": "NFT-765",
        "contractAddress": "0x1234...abcd",
        "type": "land",
        "category": "Winter",
        "rarity": "rare",
        "season": "Spring: Jan-Feb",
        "effect": "30% increase in productivity",
        "level": 7,
        "exp": 9942,
        "totalSupply": 9999,
        "currentSupply": 5000,
        "price": {
          "amount": 2935.50,
          "currency": "CW",
          "decimals": 6
        },
        "seller": {
          "id": "uuid",
          "username": "Seller Name"
        },
        "metadata": {
          "name": "Winter Land",
          "description": "A beautiful winter landscape",
          "imageUrl": "https://example.com/nft.jpg",
          "attributes": []
        },
        "listedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1500,
      "totalPages": 75,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "applied": ["type", "rarity"],
      "available": ["type", "category", "rarity", "price_range", "level"]
    },
    "marketStats": {
      "totalListings": 1500,
      "averagePrice": 2500.75,
      "totalVolume24h": 50000.00
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/v1/market/nfts/:id`

**Description**: Get specific NFT details

**Response**:

```json
{
  "success": true,
  "data": {
    "nft": {
      "id": "uuid",
      "tokenId": "NFT-765",
      "contractAddress": "0x1234...abcd",
      "type": "character",
      "category": "Warrior",
      "rarity": "rare",
      "level": 7,
      "exp": 9942,
      "metadata": {
        "name": "Dragon Warrior",
        "description": "A powerful warrior with dragon abilities",
        "imageUrl": "https://example.com/nft.jpg",
        "attributes": []
      },
      "stats": {
        "strength": 37,
        "speed": 246,
        "health": 2534,
        "defense": 6457
      },
      "ownership": {
        "currentOwner": {
          "id": "uuid",
          "username": "Owner Name"
        },
        "isListed": true,
        "listingPrice": {
          "amount": 2935.50,
          "currency": "CW",
          "decimals": 6
        }
      },
      "transactionHistory": [
        {
          "type": "purchase",
          "price": {
            "amount": 2500.00,
            "currency": "CW"
          },
          "from": "Previous Owner",
          "to": "Current Owner",
          "timestamp": "2024-01-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/v1/market/nfts/list`

**Description**: List NFT for sale

**Request Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "nftId": "uuid (required)",
  "price": {
    "amount": 2935.50,
    "currency": "CW"
  },
  "expiresAt": "2024-02-01T00:00:00.000Z (optional, default: 30 days)"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "listing": {
      "id": "uuid",
      "nftId": "uuid",
      "price": {
        "amount": 2935.50,
        "currency": "CW",
        "decimals": 6
      },
      "status": "active",
      "listedAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-02-01T00:00:00.000Z"
    },
    "message": "NFT listed successfully"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/v1/market/nfts/buy`

**Description**: Purchase NFT from marketplace

**Request Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "listingId": "uuid (required)"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "type": "purchase",
      "nftId": "uuid",
      "price": {
        "amount": 2935.50,
        "currency": "CW",
        "decimals": 6
      },
      "buyer": {
        "id": "uuid",
        "username": "Buyer Name"
      },
      "seller": {
        "id": "uuid",
        "username": "Seller Name"
      },
      "status": "completed",
      "completedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "NFT purchased successfully"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `PUT /api/v1/market/nfts/:id/update-price`

**Description**: Update listing price

**Request Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "price": {
    "amount": 3500.00,
    "currency": "CW"
  }
}
```

#### `DELETE /api/v1/market/nfts/:id/delist`

**Description**: Remove NFT from marketplace

**Request Headers**:

```
Authorization: Bearer <access_token>
```

---

## 4. Auction System

### Auction Endpoints

#### `GET /api/v1/market/auctions`

**Description**: Get active auctions

**Query Parameters**:

```
status: string (active|ended|cancelled, optional)
type: string (character|land|item, optional)
rarity: string (common|uncommon|rare|epic|legendary, optional)
page: number (default: 1)
limit: number (default: 20, max: 100)
```

**Response**:

```json
{
  "success": true,
  "data": {
    "auctions": [
      {
        "id": "uuid",
        "nftId": "uuid",
        "tokenId": "NFT-765",
        "type": "character",
        "rarity": "rare",
        "startingPrice": {
          "amount": 50.00,
          "currency": "CW",
          "decimals": 6
        },
        "currentPrice": {
          "amount": 94.203,
          "currency": "CW",
          "decimals": 6
        },
        "minBidIncrement": {
          "amount": 1.00,
          "currency": "CW",
          "decimals": 6
        },
        "startTime": "2024-01-01T00:00:00.000Z",
        "endTime": "2024-01-07T00:00:00.000Z",
        "timeRemaining": "5 days 12 hours 30 minutes",
        "totalBids": 15,
        "highestBidder": {
          "id": "uuid",
          "username": "Top Bidder"
        },
        "status": "active",
        "nft": {
          "level": 7,
          "exp": 9942,
          "stats": {
            "strength": 37,
            "speed": 246,
            "health": 2534,
            "defense": 6457
          }
        }
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/v1/market/auctions/create`

**Description**: Create new auction

**Request Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "nftId": "uuid (required)",
  "startingPrice": {
    "amount": 50.00,
    "currency": "CW"
  },
  "minBidIncrement": {
    "amount": 1.00,
    "currency": "CW"
  },
  "duration": 604800,
  "reservePrice": {
    "amount": 100.00,
    "currency": "CW"
  }
}
```

#### `GET /api/v1/market/auctions/:id`

**Description**: Get auction details

**Response**:

```json
{
  "success": true,
  "data": {
    "auction": {
      "id": "uuid",
      "nftId": "uuid",
      "startingPrice": {
        "amount": 50.00,
        "currency": "CW",
        "decimals": 6
      },
      "currentPrice": {
        "amount": 94.203,
        "currency": "CW",
        "decimals": 6
      },
      "reservePrice": {
        "amount": 100.00,
        "currency": "CW",
        "decimals": 6
      },
      "minBidIncrement": {
        "amount": 1.00,
        "currency": "CW",
        "decimals": 6
      },
      "startTime": "2024-01-01T00:00:00.000Z",
      "endTime": "2024-01-07T00:00:00.000Z",
      "timeRemaining": "5 days 12 hours 30 minutes",
      "totalBids": 15,
      "status": "active",
      "nft": {
        "tokenId": "NFT-765",
        "type": "character",
        "rarity": "rare",
        "level": 7,
        "exp": 9942
      }
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/v1/market/auctions/:id/bids`

**Description**: Get auction bid history

**Query Parameters**:

```
page: number (default: 1)
limit: number (default: 20, max: 100)
```

**Response**:

```json
{
  "success": true,
  "data": {
    "bids": [
      {
        "id": "uuid",
        "amount": {
          "amount": 94.203,
          "currency": "CW",
          "decimals": 6
        },
        "bidder": {
          "id": "uuid",
          "username": "Bidder Name"
        },
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/v1/market/auctions/:id/bid`

**Description**: Place bid on auction

**Request Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "amount": {
    "amount": 95.00,
    "currency": "CW"
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "bid": {
      "id": "uuid",
      "amount": {
        "amount": 95.00,
        "currency": "CW",
        "decimals": 6
      },
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    "message": "Bid placed successfully"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `PUT /api/v1/market/auctions/:id/cancel`

**Description**: Cancel auction (owner only)

**Request Headers**:

```
Authorization: Bearer <access_token>
```

#### `POST /api/v1/market/auctions/:id/end`

**Description**: End auction early (owner only)

**Request Headers**:

```
Authorization: Bearer <access_token>
```

---

## 5. Wallet & Transactions

### Wallet Endpoints

#### `GET /api/v1/market/wallet/balance`

**Description**: Get wallet balance

**Request Headers**:

```
Authorization: Bearer <access_token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "balance": {
      "amount": 3893.345,
      "currency": "CW",
      "decimals": 6
    },
    "totalValue": {
      "amount": 15000.50,
      "currency": "USD"
    },
    "exchangeRate": {
      "CW": {
        "USD": 3.85,
        "BNB": 0.0012
      }
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/v1/market/wallet/deposit`

**Description**: Deposit funds to wallet

**Request Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "amount": {
    "amount": 1000.00,
    "currency": "CW"
  },
  "paymentMethod": "string (bank_transfer|crypto|credit_card)"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "type": "deposit",
      "amount": {
        "amount": 1000.00,
        "currency": "CW",
        "decimals": 6
      },
      "status": "pending",
      "paymentUrl": "https://payment.gateway.com/pay/123",
      "expiresAt": "2024-01-01T01:00:00.000Z"
    },
    "newBalance": {
      "amount": 4893.345,
      "currency": "CW",
      "decimals": 6
    },
    "message": "Deposit initiated successfully"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/v1/market/wallet/withdraw`

**Description**: Withdraw funds from wallet

**Request Headers**:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "amount": {
    "amount": 500.00,
    "currency": "CW"
  },
  "destinationAddress": "string (wallet address or bank account)"
}
```

### Transaction History

#### `GET /api/v1/market/transactions`

**Description**: Get transaction history

**Request Headers**:

```
Authorization: Bearer <access_token>
```

**Query Parameters**:

```
type: string (purchase|sale|deposit|withdrawal|bid, optional)
status: string (pending|completed|failed|cancelled, optional)
startDate: string (ISO date, optional)
endDate: string (ISO date, optional)
page: number (default: 1)
limit: number (default: 20, max: 100)
```

**Response**:

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "purchase",
        "amount": {
          "amount": 2935.50,
          "currency": "CW",
          "decimals": 6
        },
        "fee": {
          "amount": 29.36,
          "currency": "CW",
          "decimals": 6
        },
        "status": "completed",
        "description": "Purchased NFT-765",
        "relatedNft": {
          "id": "uuid",
          "tokenId": "NFT-765",
          "type": "character"
        },
        "counterparty": {
          "id": "uuid",
          "username": "Seller Name"
        },
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    },
    "summary": {
      "totalPurchases": 25,
      "totalSales": 15,
      "totalDeposits": 5000.00,
      "totalWithdrawals": 2000.00
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/v1/market/transactions/:id`

**Description**: Get specific transaction details

**Request Headers**:

```
Authorization: Bearer <access_token>
```

---

## 6. Content Management

### News & Events

#### `GET /api/v1/market/content/news`

**Description**: Get news articles

**Query Parameters**:

```
category: string (general|updates|events, optional)
page: number (default: 1)
limit: number (default: 10, max: 50)
```

**Response**:

```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "uuid",
        "slug": "telegram-mining-apps-notcoin-wave",
        "title": "5 Must-Try Telegram Mining Apps Riding the Notcoin (NOT) Wave",
        "excerpt": "A new era in the crypto space has dawned...",
        "content": "Full article content...",
        "category": "general",
        "author": "GAMEFLO",
        "publishedAt": "2024-02-22T00:00:00.000Z",
        "imageUrl": "https://example.com/news-image.jpg",
        "videoUrl": "https://example.com/video.mp4",
        "tags": ["mining", "telegram", "notcoin"]
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/v1/market/content/news/:slug`

**Description**: Get specific news article

#### `GET /api/v1/market/content/guides`

**Description**: Get game guides and tutorials

**Query Parameters**:

```
category: string (beginner|advanced|trading, optional)
page: number (default: 1)
limit: number (default: 10, max: 50)
```

#### `GET /api/v1/market/content/events`

**Description**: Get active events and banners

**Response**:

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "title": "Limited Sale",
        "description": "Gen-1 NFT Egg available now!",
        "type": "sale",
        "startDate": "2024-06-25T00:00:00.000Z",
        "endDate": "2024-06-30T23:59:59.000Z",
        "imageUrl": "https://example.com/banner.jpg",
        "actionUrl": "https://marketplace.com/sale",
        "isActive": true
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 7. Analytics & Monitoring

### Market Analytics

#### `GET /api/v1/market/analytics/market-stats`

**Description**: Get market statistics

**Query Parameters**:

```
period: string (24h|7d|30d|all, default: 24h)
```

**Response**:

```json
{
  "success": true,
  "data": {
    "marketStats": {
      "totalVolume": {
        "amount": 150000.00,
        "currency": "CW"
      },
      "totalTransactions": 1250,
      "averagePrice": {
        "amount": 2500.75,
        "currency": "CW"
      },
      "activeListings": 1500,
      "activeAuctions": 50,
      "uniqueTraders": 450
    },
    "trends": {
      "volumeChange": 12.5,
      "priceChange": -2.3,
      "listingChange": 5.8
    },
    "topCategories": [
      {
        "category": "Warrior",
        "volume": 45000.00,
        "transactions": 180
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/v1/market/analytics/price-history/:nftId`

**Description**: Get price history for specific NFT

**Query Parameters**:

```
period: string (7d|30d|90d|1y, default: 30d)
```

### Health Monitoring

#### `GET /api/v1/market/health`

**Description**: Basic health check

**Response**:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

#### `GET /api/v1/market/health/detailed`

**Description**: Detailed system status

**Response**:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "healthy",
      "cache": "healthy",
      "blockchain": "healthy",
      "payment": "healthy"
    },
    "metrics": {
      "responseTime": 150,
      "errorRate": 0.01,
      "activeConnections": 1250
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 8. Error Handling

### Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input parameters |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Error Response Examples

#### Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Authentication Error

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Resource Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "NFT with ID 'uuid' not found"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 9. Rate Limiting

### Rate Limit Headers

All API responses include rate limiting headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Rules

- **Authentication endpoints**: 10 requests per minute
- **General endpoints**: 100 requests per minute
- **Heavy operations**: 20 requests per minute
- **File uploads**: 10 requests per hour

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds."
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 10. Webhooks

### Webhook Endpoints

```
POST /api/v1/market/webhooks/transaction-completed
POST /api/v1/market/webhooks/auction-ended
POST /api/v1/market/webhooks/nft-listed
POST /api/v1/market/webhooks/user-registered
```

### Webhook Payload Example

```json
{
  "event": "transaction.completed",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "transactionId": "uuid",
    "type": "purchase",
    "amount": {
      "amount": 2935.50,
      "currency": "CW"
    },
    "nftId": "uuid",
    "buyer": {
      "id": "uuid",
      "username": "Buyer Name"
    },
    "seller": {
      "id": "uuid",
      "username": "Seller Name"
    }
  }
}
```

---

## 11. SDK & Integration

### SDK Support

- JavaScript/TypeScript SDK
- Python SDK
- Mobile SDKs (iOS/Android)
- Unity/Unreal Engine plugins

### API Client Libraries

```bash
npm install @cwgame/marketplace-sdk
pip install cwgame-marketplace
```

---

## 12. Migration Guide

### From v0.x to v1.0

- All endpoints now require `/api/v1/market` prefix
- Response format standardized
- Error handling improved
- Rate limiting implemented
- Webhook support added

### Breaking Changes

- Authentication endpoints moved to `/api/v1/market/auth/`
- User endpoints moved to `/api/v1/market/users/`
- NFT endpoints moved to `/api/v1/market/nfts/`
- All response formats updated

---

## 13. Support & Documentation

### API Documentation

- Interactive API docs: `https://api.cwgame.com/docs`
- Postman collection: Available for download
- SDK documentation: Available in respective repositories

### Support Channels

- Email: <api-support@cwgame.com>
- Discord: #api-support
- Documentation: <https://docs.cwgame.com/api>

### Status Page

- API status: <https://status.cwgame.com>
- Incident history and maintenance schedules
