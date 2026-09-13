const User = require('../models/User');

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    profileImage: user.profileImage,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ─── GET /admin/users ──────────────────────────────────────────────────────────
// Dashboard's user list: search by name/email/phone/id, filter by
// registration date/account status/role, paginate, sort.
async function listUsers(req, res) {
  console.log('[listUsers] fetching users with filters...');
  try {
    const {
      search, role, status, // status: 'active' | 'inactive'
      dateFrom, dateTo,
      page = 1, limit = 20,
      sort = 'newest',
    } = req.query;

    const filter = {};

    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search) {
      const orClauses = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        orClauses.push({ _id: search });
      }
      filter.$or = orClauses;
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name: { name: 1 },
    };
    const sortOrder = sortMap[sort] || sortMap.newest;

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter).select('-password -refreshTokens -resetPasswordToken -resetPasswordExpiry')
        .sort(sortOrder).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      users: users.map(publicUser),
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[listUsers]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─── GET /admin/users/:id ──────────────────────────────────────────────────────
async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select(
      '-password -refreshTokens -resetPasswordToken -resetPasswordExpiry'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('[getUserById]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─── PATCH /admin/users/:id/status ────────────────────────────────────────────
// Body: { isActive }. Deactivating a user also revokes all their refresh
// tokens, so an active session can't keep working after deactivation.
async function setUserActiveStatus(req, res) {
  console.log('[setUserActiveStatus]', req.params.id, req.body);
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Guard against accidentally locking out the last super_admin — mirrors
    // the dashboard's "prevent accidental deletion of important admin
    // accounts" requirement, applied here to deactivation too.
    if (!isActive && user.role === 'super_admin') {
      const otherActiveSuperAdmins = await User.countDocuments({
        role: 'super_admin',
        isActive: true,
        _id: { $ne: user._id },
      });
      if (otherActiveSuperAdmins === 0) {
        return res.status(400).json({
          message: 'Cannot deactivate the last active super_admin account',
        });
      }
    }

    user.isActive = isActive;
    if (!isActive) {
      user.refreshTokens.forEach((t) => {
        if (!t.revokedAt) t.revokedAt = new Date();
      });
    }
    await user.save();

    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('[setUserActiveStatus]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─── DELETE /admin/users/:id ───────────────────────────────────────────────────
async function deleteUser(req, res) {
  console.log('[deleteUser]', req.params.id);
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Same last-super_admin guard as deactivation, but for permanent deletion.
    if (user.role === 'super_admin') {
      const otherSuperAdmins = await User.countDocuments({
        role: 'super_admin',
        _id: { $ne: user._id },
      });
      if (otherSuperAdmins === 0) {
        return res.status(400).json({ message: 'Cannot delete the last super_admin account' });
      }
    }

    // Prevent self-deletion through the admin panel — avoids an admin
    // locking themselves out mid-session by mistake.
    if (String(user._id) === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted', id: req.params.id });
  } catch (err) {
    console.error('[deleteUser]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { listUsers, getUserById, setUserActiveStatus, deleteUser };
