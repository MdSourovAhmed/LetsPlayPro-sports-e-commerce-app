// Mirrors letsplaypro (storefront) src/utils/constants.js SPORTS/PRODUCT_TYPES exactly —
// keep these two lists in sync. A product created here with a sport/type outside these lists
// would still save fine (the schema field is free-text), but it wouldn't show up under any
// of the storefront's sport/type filter checkboxes, effectively making it undiscoverable
// outside of search.
export const SPORTS = ['Badminton', 'Basketball', 'Cricket', 'Fitness', 'Football', 'Tennis'];

export const PRODUCT_TYPES = ['Accessory', 'Bag', 'Bat', 'Ball', 'Cap', 'Gloves', 'Net', 'Racket', 'Shoes'];

export const PRODUCT_STATUSES = ['active', 'draft', 'out_of_stock', 'archived'];

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'];

export const PAYMENT_METHODS = ['cod', 'bkash', 'nagad', 'card'];

export const USER_ROLES = ['user', 'staff', 'admin', 'super_admin'];
