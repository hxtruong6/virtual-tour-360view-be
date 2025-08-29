#!/bin/bash

# Virtual Tour Platform - Database Seeding Script
# This script seeds the database with the initial admin user and sample data

set -e

echo "🌱 Virtual Tour Platform Database Seeding"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your DATABASE_URL before running this script."
    exit 1
fi

# Check if database connection is available
echo "🔍 Checking database connection..."
if ! npm run db:seed -- --dry-run &>/dev/null; then
    echo "⚠️  Warning: Could not verify database connection"
    echo "Make sure your DATABASE_URL is correct and database is running"
    echo ""
fi

echo "🚀 Starting database seeding process..."
echo ""

# Run the seed script
npm run db:seed

echo ""
echo "✅ Database seeding completed!"
echo ""
echo "📋 What was created:"
echo "  • Super Admin user with ID: 00000000-0000-0000-0000-000000000001"
echo "  • Email: admin@virtualtour.com"
echo "  • Username: admin"
echo "  • Default password: Admin@123456"
echo "  • Sample demo tour with welcome scene"
echo ""
echo "🔐 Security Notes:"
echo "  • Change the default admin password after first login"
echo "  • The admin user ID matches your ADMIN_USER_ID constant"
echo "  • Use this admin for creating virtual tours"
echo ""
echo "🎯 Next Steps:"
echo "  1. Start your application: npm run start:dev"
echo "  2. Login with admin credentials"
echo "  3. Test creating virtual tours (they will use admin ID correctly)"
echo "  4. Change the default password"
echo ""
