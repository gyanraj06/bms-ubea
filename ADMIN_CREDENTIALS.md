# Admin Dashboard - Test Credentials

## Test Login Credentials

These credentials are for development and testing purposes only. Replace with proper authentication in production.

### Owner/Admin Role
- **Email**: `owner@happyholidays.com`
- **Password**: `Owner@123`
- **Permissions**: Full access to all features

### Manager Role
- **Email**: `manager@happyholidays.com`
- **Password**: `Manager@123`
- **Permissions**: All operations except user management and financial settings

### Front Desk Role
- **Email**: `frontdesk@happyholidays.com`
- **Password**: `FrontDesk@123`
- **Permissions**: Bookings, check-in/out, guest management, room status

### Accountant Role
- **Email**: `accountant@happyholidays.com`
- **Password**: `Accountant@123`
- **Permissions**: Payments, invoices, financial reports, GST reports

---

## Role-Based Access Control (RBAC)

| Feature | Owner | Manager | Front Desk | Accountant |
|---------|-------|---------|------------|------------|
| Dashboard Overview | ✓ | ✓ | ✓ | ✓ |
| Bookings Management | ✓ | ✓ | ✓ | ✗ |
| Check-in/Check-out | ✓ | ✓ | ✓ | ✗ |
| Room/Hall Inventory | ✓ | ✓ | View Only | ✗ |
| Guest Management | ✓ | ✓ | ✓ | View Only |
| Payments & Finance | ✓ | ✓ | ✗ | ✓ |
| Reports & Analytics | ✓ | ✓ | Limited | ✓ |
| Photo Gallery | ✓ | ✓ | ✗ | ✗ |
| Website Settings | ✓ | Limited | ✗ | ✗ |
| User Management | ✓ | ✗ | ✗ | ✗ |
| Communication | ✓ | ✓ | ✓ | ✓ |

---

## Security Notes

- All login attempts are logged
- Session timeout: 2 hours of inactivity
- Password must be changed after first login (to be implemented)
- Two-factor authentication (to be implemented for Owner role)
- IP address logging enabled

---

## Development Notes

- These credentials are hardcoded for initial development
- Backend authentication API will replace this system
- JWT tokens will be used for session management
- Role permissions will be enforced on both frontend and backend
