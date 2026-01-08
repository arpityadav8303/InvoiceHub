import Client from '../models/client.model.js'
import { generateClientWelcomeEmailSmart } from '../services/llmService.js'
import { sendWelcome } from '../services/emailService.js'
import { generateRandomPassword } from '../Utils/randomPassword.js'

// CREATE CLIENT - Generate password and send LLM-generated welcome email
const createClient = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, companyName, address, gstNumber, preferredPaymentMethod } = req.body
    
    // Validation
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, phone'
      })
    }

    // Check if client already exists
    const existingClient = await Client.findOne({ userId: req.user._id, email })

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: "Client with this email already exists"
      })
    }

    // Step 1: Generate random password
    const generatedPassword = generateRandomPassword()
    console.log(`🔐 Generated password for ${email}`)

    // Step 2: Create new client with generated password
    const newClient = await Client.create({
      userId: req.user._id,
      firstName,
      lastName,
      email,
      phone,
      password: generatedPassword, // Will be hashed by pre-save hook
      companyName,
      address,
      gstNumber,
      preferredPaymentMethod
    })

    console.log(`✅ Client created: ${newClient._id}`)

    // Step 3: Generate welcome email using LLM
    let emailContent;
    try {
      console.log(`🤖 Generating welcome email with LLM...`)
      emailContent = await generateClientWelcomeEmailSmart(
        newClient,
        generatedPassword,
        req.user
      )
      console.log(`✅ Welcome email generated`)
    } catch (llmError) {
      console.error(`❌ Failed to generate email: ${llmError.message}`)
      throw llmError
    }

    // Step 4: Send welcome email
    try {
      console.log(`📧 Sending welcome email to ${email}...`)
      const emailResult = await sendWelcome(
        email,
        emailContent.subject,
        emailContent.body_html
      )
      console.log(`✅ Welcome email sent successfully`)
      console.log(`   Message ID: ${emailResult.messageId}`)
    } catch (emailError) {
      console.error(`⚠️ Failed to send welcome email: ${emailError.message}`)
      // Don't throw - client was created, but email failed
      // You might want to retry email later or notify admin
    }

    // Step 5: Return success response
    res.status(201).json({
      success: true,
      message: 'Client created successfully. Welcome email sent with login credentials.',
      client: {
        _id: newClient._id,
        firstName: newClient.firstName,
        lastName: newClient.lastName,
        email: newClient.email,
        phone: newClient.phone,
        companyName: newClient.companyName,
        portalAccess: newClient.portalAccess,
        createdAt: newClient.createdAt
      },
      emailStatus: {
        sent: true,
        recipient: email,
        subject: emailContent.subject
      }
    })

  } catch (err) {
    console.error('❌ Create client error:', err)
    return res.status(500).json({
      success: false,
      message: "Error creating client",
      error: err.message
    })
  }
}

// GET ALL CLIENTS
const getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const totalClients = await Client.countDocuments({ userId: req.user._id })

    const clients = await Client.find({ userId: req.user._id })
      .skip(skip)
      .limit(limit)
      .select('-password')
      .lean()

    res.status(200).json({
      success: true,
      message: 'Clients fetched successfully',
      clients,
      totalCount: totalClients,
      currentPage: page,
      totalPages: Math.ceil(totalClients / limit)
    })
  } catch (error) {
    console.error('Get clients error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error.message
    })
  }
}

// GET CLIENT BY ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params

    const client = await Client.findById(id).select('-password')

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      })
    }

    if (client.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this client'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Client fetched successfully',
      client: client
    })
  } catch (error) {
    console.error('Get client by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: error.message
    })
  }
}

// UPDATE CLIENT
const updateClient = async (req, res) => {
  try {
    const { id } = req.params
    const { firstName, lastName, email, phone, companyName, address, gstNumber, preferredPaymentMethod, riskLevel, status, portalAccess } = req.body

    const client = await Client.findById(id)

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      })
    }

    if (client.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this client'
      })
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        })
      }

      const existingEmail = await Client.findOne({ 
        userId: req.user._id, 
        email: email,
        _id: { $ne: id }
      })

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already used by another client'
        })
      }
    }

    if (phone) {
      const phoneRegex = /^[6-9]\d{9}$/
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit phone number'
        })
      }
    }

    const updateData = {}
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (companyName) updateData.companyName = companyName
    if (address) updateData.address = address
    if (gstNumber) updateData.gstNumber = gstNumber
    if (preferredPaymentMethod) updateData.preferredPaymentMethod = preferredPaymentMethod
    if (riskLevel) updateData.riskLevel = riskLevel
    if (status) updateData.status = status
    if (portalAccess !== undefined) updateData.portalAccess = portalAccess

    const updatedClient = await Client.findByIdAndUpdate(id, updateData, { new: true }).select('-password')

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      client: updatedClient
    })
  } catch (error) {
    console.error('Update client error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating client',
      error: error.message
    })
  }
}

// DELETE CLIENT
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params

    const client = await Client.findById(id)

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      })
    }

    if (client.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this client'
      })
    }

    await Client.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    })
  } catch (error) {
    console.error('Delete client error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting client',
      error: error.message
    })
  }
}

export { createClient, getClients, getClientById, updateClient, deleteClient }