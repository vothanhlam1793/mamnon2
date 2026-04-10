#!/bin/bash
# ============================================
# MAMNON2 - SCRIPT CLONE TRƯỜNG MỚI
# ============================================
# Hướng dẫn:
#   bash clone-school.sh
# ============================================

set -e

# Màu
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║     🎓 MAMNON2 - CLONE TRƯỜNG MỚI                    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ============================================
# BƯỚC 1: Nhập tên trường
# ============================================
read -p "📝 Nhập tên trường (không dấu, không khoảng trắng): " SCHOOL_NAME

if [ -z "$SCHOOL_NAME" ]; then
    echo -e "${RED}❌ Tên trường không được trống!${NC}"
    exit 1
fi

# Chuyển thành slug
SLUG=$(echo "$SCHOOL_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-\|-$//g')

DB_NAME="mamnon2-$SLUG"
DB_SESSION="mamnon2-$SLUG-session"

# ============================================
# BƯỚC 2: Nhập thông tin MongoDB
# ============================================
echo ""
echo -e "${CYAN}🗄️  Nhập thông tin kết nối MongoDB:${NC}"
echo ""

# Lấy giá trị mặc định từ .env hiện tại
CURRENT_MONGO_URL=$(grep "^MONGO_URL=" .env 2>/dev/null | cut -d'=' -f2-)
DEFAULT_HOST=$(echo "$CURRENT_MONGO_URL" | sed 's|mongodb://||' | cut -d':' -f1 | cut -d'@' -f2)
DEFAULT_PORT=$(echo "$CURRENT_MONGO_URL" | sed 's|mongodb://||' | cut -d':' -f2 | cut -d'/' -f1)
DEFAULT_USER=$(grep "^MONGO_USER=" .env 2>/dev/null | cut -d'=' -f2-)
DEFAULT_PASS=$(grep "^MONGO_PASS=" .env 2>/dev/null | cut -d'=' -f2-)
DEFAULT_AUTH=$(grep "^MONGO_AUTH_SOURCE=" .env 2>/dev/null | cut -d'=' -f2-)
DEFAULT_PORT=${DEFAULT_PORT:-27017}
DEFAULT_AUTH=${DEFAULT_AUTH:-admin}

read -p "   Host MongoDB [$DEFAULT_HOST]: " MONGO_HOST
MONGO_HOST=${MONGO_HOST:-$DEFAULT_HOST}

read -p "   Port MongoDB [$DEFAULT_PORT]: " MONGO_PORT
MONGO_PORT=${MONGO_PORT:-$DEFAULT_PORT}

read -p "   User MongoDB [$DEFAULT_USER]: " MONGO_USER
MONGO_USER=${MONGO_USER:-$DEFAULT_USER}

read -sp "   Password MongoDB: " MONGO_PASS
MONGO_PASS=${MONGO_PASS:-$DEFAULT_PASS}
echo ""

read -p "   Auth source [$DEFAULT_AUTH]: " MONGO_AUTH
MONGO_AUTH=${MONGO_AUTH:-$DEFAULT_AUTH}

# Build URL đầy đủ
if [ -n "$MONGO_USER" ] && [ -n "$MONGO_PASS" ]; then
    MONGO_BASE_URL="mongodb://$MONGO_HOST:$MONGO_PORT"
    MONGO_URL_FULL="$MONGO_BASE_URL/$DB_NAME"
    MONGO_URL_SESSION_FULL="$MONGO_BASE_URL/$DB_SESSION"
else
    MONGO_BASE_URL="mongodb://$MONGO_HOST:$MONGO_PORT"
    MONGO_URL_FULL="$MONGO_BASE_URL/$DB_NAME"
    MONGO_URL_SESSION_FULL="$MONGO_BASE_URL/$DB_SESSION"
fi

# ============================================
# BƯỚC 3: Xác nhận thông tin
# ============================================
echo ""
echo -e "${YELLOW}📋 Thông tin trường mới:${NC}"
echo "   Tên trường : $SCHOOL_NAME"
echo "   Slug       : $SLUG"
echo "   DB chính   : $DB_NAME"
echo "   DB session : $DB_SESSION"
echo "   MongoDB    : $MONGO_HOST:$MONGO_PORT"
echo ""

read -p "✅ Tiếp tục? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "❌ Đã hủy."
    exit 0
fi

# ============================================
# BƯỚC 4: Kiểm tra MongoDB - DB đã tồn tại?
# ============================================
echo ""
echo -e "${CYAN}🔍 Đang kiểm tra MongoDB...${NC}"

DB_EXISTS="unknown"

if command -v mongosh &> /dev/null; then
    if [ -n "$MONGO_USER" ] && [ -n "$MONGO_PASS" ]; then
        DB_EXISTS=$(mongosh "$MONGO_BASE_URL/admin" \
            --username "$MONGO_USER" --password "$MONGO_PASS" \
            --authenticationDatabase "$MONGO_AUTH" \
            --quiet \
            --eval "db.adminCommand({listDatabaseNames:1}).databases.map(d=>d.name).includes('$DB_NAME')" \
            2>/dev/null || echo "unknown")
    else
        DB_EXISTS=$(mongosh "$MONGO_BASE_URL/admin" \
            --quiet \
            --eval "db.adminCommand({listDatabaseNames:1}).databases.map(d=>d.name).includes('$DB_NAME')" \
            2>/dev/null || echo "unknown")
    fi
elif command -v mongo &> /dev/null; then
    if [ -n "$MONGO_USER" ] && [ -n "$MONGO_PASS" ]; then
        DB_EXISTS=$(mongo "$MONGO_BASE_URL/admin" \
            --username "$MONGO_USER" --password "$MONGO_PASS" \
            --authenticationDatabase "$MONGO_AUTH" \
            --quiet \
            --eval "db.adminCommand({listDatabaseNames:1}).databases.map(function(d){return d.name}).indexOf('$DB_NAME') >= 0" \
            2>/dev/null || echo "unknown")
    fi
else
    echo -e "${YELLOW}   ⚠️  Không tìm thấy mongosh/mongo CLI - bỏ qua kiểm tra DB${NC}"
    DB_EXISTS="unknown"
fi

# ============================================
# BƯỚC 5: Xử lý kết quả kiểm tra
# ============================================
if [ "$DB_EXISTS" == "true" ]; then
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️  CẢNH BÁO: DATABASE ĐÃ TỒN TẠI!                  ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}   Database '$DB_NAME' đã tồn tại!${NC}"
    echo -e "${RED}   Đây có thể là dữ liệu của trường cũ.${NC}"
    echo ""
    echo "   1. Hủy bỏ (an toàn - giữ nguyên DB cũ)"
    echo "   2. Tiếp tục (DB cũ vẫn giữ, chạy song song)"
    echo ""
    read -p "   Chọn (1/2): " DB_CHOICE

    if [ "$DB_CHOICE" == "1" ] || [ -z "$DB_CHOICE" ]; then
        echo -e "${YELLOW}   ❌ Đã hủy.${NC}"
        exit 0
    fi

    echo -e "${YELLOW}   ⚠️  Tiếp tục với DB đã tồn tại...${NC}"

elif [ "$DB_EXISTS" == "false" ]; then
    echo -e "${GREEN}   ✅ Database '$DB_NAME' chưa tồn tại - an toàn để clone!${NC}"
else
    echo -e "${YELLOW}   ⚠️  Không thể kiểm tra DB - tiếp tục thủ công${NC}"
fi

# ============================================
# BƯỚC 6: Clone repo
# ============================================
echo ""
echo -e "${GREEN}🔄 Đang clone repo...${NC}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
NEW_DIR="$PARENT_DIR/mamnon2-$SLUG"

if [ -d "$NEW_DIR" ]; then
    echo -e "${RED}❌ Thư mục mamnon2-$SLUG đã tồn tại!${NC}"
    exit 1
fi

git clone "$SCRIPT_DIR" "$NEW_DIR"
cd "$NEW_DIR"

# ============================================
# BƯỚC 7: Tạo .env tự động
# ============================================
echo ""
echo -e "${GREEN}🔄 Đang tạo .env...${NC}"

cp .env.example .env

# Ghi đầy đủ thông tin vào .env
sed -i '' "s|MONGO_URL=.*|MONGO_URL=$MONGO_URL_FULL|g" .env
sed -i '' "s|MONGO_URL_SESSION=.*|MONGO_URL_SESSION=$MONGO_URL_SESSION_FULL|g" .env
sed -i '' "s|MONGO_USER=.*|MONGO_USER=$MONGO_USER|g" .env
sed -i '' "s|MONGO_PASS=.*|MONGO_PASS=$MONGO_PASS|g" .env
sed -i '' "s|MONGO_AUTH_SOURCE=.*|MONGO_AUTH_SOURCE=$MONGO_AUTH|g" .env
sed -i '' "s|COOKIE_SECRET=.*|COOKIE_SECRET=cookie_$(date +%s)_$SLUG|g" .env

echo -e "${GREEN}   ✅ .env đã được tạo tự động!${NC}"

# ============================================
# BƯỚC 8: Cài đặt dependencies
# ============================================
echo ""
echo -e "${GREEN}🔄 Đang cài đặt dependencies...${NC}"
npm install

# ============================================
# BƯỚC 9: Hoàn tất
# ============================================
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ HOÀN TẤT!${NC}"
echo ""
echo "   📁 Thư mục : $NEW_DIR"
echo "   🗄️  Database : $DB_NAME"
echo "   🔗 Login   : http://localhost:3000/login"
echo "   🔗 Admin   : http://localhost:3000/admin"
echo "   👤 User    : admin"
echo "   🔑 Pass    : admin"
echo ""
echo "   Sau khi đăng nhập Admin:"
echo "   → Vào Schools để đổi tên, logo, màu trường!"
echo ""
echo -e "${GREEN}   cd $NEW_DIR && npm run dev${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
