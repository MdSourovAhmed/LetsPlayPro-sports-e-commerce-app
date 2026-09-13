const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// ─── GET /user/profile ────────────────────────────────────────────────────────
// NOTE: req.user is set by authClientUser middleware as { id, role } —
// it is NOT a full Mongo document, so we re-fetch here.
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('[getProfile]', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
}

// ─── PUT /user/profile ────────────────────────────────────────────────────────
async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingImage = user.profileImage;
    let profileImageUrl = req.body.profileImage;

    // If a previous image exists and a new one is being sent, remove the old one
    if (profileImageUrl && existingImage) {
      try {
        const publicId = existingImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`user_profiles/${publicId}`);
      } catch (destroyErr) {
        // Non-fatal — log and continue with the update
        console.warn('[updateProfile] failed to remove old image:', destroyErr.message);
      }
    }

    // If profileImage is a base64 string, upload to Cloudinary
    if (profileImageUrl && profileImageUrl.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(profileImageUrl, {
        folder: 'user_profiles',
        width: 500,
        height: 500,
        crop: 'fill',
      });
      profileImageUrl = uploadResponse.secure_url;
    }

    const updates = {
      name:         req.body.name    ?? user.name,
      phone:        req.body.phone   ?? user.phone,
      address:      req.body.address ?? user.address,
      profileImage: profileImageUrl  ?? user.profileImage,
      // email intentionally excluded — changing it should go through a
      // verification flow, not a plain profile PUT
    };

    const userUpdated = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!userUpdated) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated successfully', user: userUpdated });
  } catch (err) {
    console.error('[updateProfile]', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
}

// ─── GET /user/addresses ───────────────────────────────────────────────────────
async function listAddresses(req, res) {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error('[listAddresses]', err);
    res.status(500).json({ message: 'Server error fetching addresses' });
  }
}

// ─── POST /user/addresses ──────────────────────────────────────────────────────
async function addAddress(req, res) {
  try {
    const { label, firstName, lastName, street, city, zip, country, phone, isDefault } = req.body;
    if (!label || !firstName || !lastName || !street || !city || !zip || !country || !phone) {
      return res.status(400).json({ message: 'All address fields are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // First address a user ever adds is automatically their default —
    // matches the frontend's optimistic local-store behavior it's replacing.
    const shouldBeDefault = isDefault || user.addresses.length === 0;
    if (shouldBeDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }

    user.addresses.push({ label, firstName, lastName, street, city, zip, country, phone, isDefault: shouldBeDefault });
    await user.save();

    res.status(201).json({ addresses: user.addresses });
  } catch (err) {
    console.error('[addAddress]', err);
    res.status(500).json({ message: 'Server error adding address' });
  }
}

// ─── PUT /user/addresses/:addressId ────────────────────────────────────────────
async function updateAddress(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    const { label, firstName, lastName, street, city, zip, country, phone, isDefault } = req.body;
    Object.assign(address, {
      label: label ?? address.label,
      firstName: firstName ?? address.firstName,
      lastName: lastName ?? address.lastName,
      street: street ?? address.street,
      city: city ?? address.city,
      zip: zip ?? address.zip,
      country: country ?? address.country,
      phone: phone ?? address.phone,
    });

    if (isDefault) {
      user.addresses.forEach((a) => { a.isDefault = a._id.equals(address._id); });
    }

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error('[updateAddress]', err);
    res.status(500).json({ message: 'Server error updating address' });
  }
}

// ─── DELETE /user/addresses/:addressId ─────────────────────────────────────────
async function deleteAddress(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    const wasDefault = address.isDefault;
    address.deleteOne();

    // If we just deleted the default address, promote the next one so the
    // user always has exactly one default whenever they have any addresses.
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error('[deleteAddress]', err);
    res.status(500).json({ message: 'Server error deleting address' });
  }
}

// ─── PATCH /user/addresses/:addressId/default ─────────────────────────────────
async function setDefaultAddress(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    user.addresses.forEach((a) => { a.isDefault = a._id.equals(address._id); });
    await user.save();

    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error('[setDefaultAddress]', err);
    res.status(500).json({ message: 'Server error setting default address' });
  }
}

module.exports = { getProfile, updateProfile, listAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };
