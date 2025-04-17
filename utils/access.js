// Utility function to check ticket access
const canViewTicket = (role_id, currentUserId, ticketOwnerId) => {
  // Super Admin (1) and Admin (2) can access all tickets
  if ([1, 2].includes(role_id)) return true;

  // Regular user (3) can access only their own tickets
  return currentUserId === ticketOwnerId;
};

module.exports = { canViewTicket };
