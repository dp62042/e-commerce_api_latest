import Address from '../models/address.model.js'

// Create new address
export const createAddress = async (req, res) => {
  try {
    const { addressLine, city, state, postalCode, country } = req.body
    const userId = req.user._id // assuming you use auth middleware that sets req.user

    const newAddress = new Address({
      user: userId,
      addressLine,
      city,
      state,
      postalCode,
      country,
    })

    const savedAddress = await newAddress.save()
    res.status(201).json(savedAddress)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating address', error: error.message })
  }
}

// Get all addresses for a user
export const getAddresses = async (req, res) => {
  try {
    const userId = req.user._id
    const addresses = await Address.find({ user: userId })
    res.status(200).json(addresses)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching addresses', error: error.message })
  }
}

// Get a single address by ID
export const getAddressById = async (req, res) => {
  try {
    const { id } = req.params
    const address = await Address.findById(id)

    if (!address) {
      return res.status(404).json({ message: 'Address not found' })
    }

    // Optional: check if the address belongs to the user
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    res.status(200).json(address)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching address', error: error.message })
  }
}

// Update an address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params
    const { addressLine, city, state, postalCode, country } = req.body

    const address = await Address.findById(id)
    if (!address) {
      return res.status(404).json({ message: 'Address not found' })
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    address.addressLine = addressLine || address.addressLine
    address.city = city || address.city
    address.state = state || address.state
    address.postalCode = postalCode || address.postalCode
    address.country = country || address.country

    const updatedAddress = await address.save()
    res.status(200).json(updatedAddress)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating address', error: error.message })
  }
}

// Delete an address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params
    const address = await Address.findById(id)

    if (!address) {
      return res.status(404).json({ message: 'Address not found' })
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    await address.remove()
    res.status(200).json({ message: 'Address deleted successfully' })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting address', error: error.message })
  }
}
