// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) =>
  Boolean(user && (user.isAdmin === true || user.role === 'ADMIN'));

const userIsStaff = ({ authentication: { item: user } }) =>
  Boolean(user && user.role === 'STAFF');

const userIsStaffOrAdmin = auth => access.userIsAdmin(auth) || userIsStaff(auth);
const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }

  // Instead of a boolean, you can return a GraphQL query:
  // https://www.keystonejs.com/api/access-control#graphqlwhere
  return { id: user.id };
};

const userIsAdminOrOwner = auth => {
  const isAdmin = access.userIsAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isAdmin ? isAdmin : isOwner;
};

const userIsStaffOrAdminOrOwner = auth => {
  const isStaffOrAdmin = userIsStaffOrAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isStaffOrAdmin ? true : isOwner;
};

const access = {
  userIsAdmin,
  userIsStaff,
  userIsStaffOrAdmin,
  userOwnsItem,
  userIsAdminOrOwner,
  userIsStaffOrAdminOrOwner
};

module.exports.access = access;
