import Client from '../models/client.model.js'

const createClient=async(req,res)=>{
    try{
       const {firstName, lastName, email, phone, companyName, address, gstNumber, preferredPaymentMethod}=req.body;
       
       if(!firstName || !lastName || !email || !phone){
          return res.status(400).json({
            success: false,
            message: 'Please provide all required fields: firstName, lastName, email, phone'
          })
        }

        const existingClient=await Client.findOne({userId:req.user._id,email})

        if(existingClient){
            return res.status(400).json({
                success:false,
                message:"Client with this email already exists"
            })
        }

        const newClient =await Client.create({
            userId: req.user._id,
            firstName,
            lastName,
            email,
            phone,
            companyName,
            address,
            gstNumber,
            preferredPaymentMethod
        })
        res.status(201).json({
         success: true,
         message: 'Client created successfully',
         client: newClient
        })

    }
    catch(err){
       console.log(err)
       return res.status(500).json({
         success:false,
         message:"Error creating client",
         error: err.message
       })
    }
}

const getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Number(req.query.limit)||10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalClients = await Client.countDocuments({ userId: req.user._id });

    // Fetch paginated clients
    const clients = await Client.find({ userId: req.user._id })
      .skip(skip)
      .limit(limit)
      .lean(); // optional: returns plain JS objects instead of Mongoose docs

    res.status(200).json({
      success: true,
      message: 'Clients fetched successfully',
      clients,
      totalCount: totalClients,
      currentPage: page,
      totalPages: Math.ceil(totalClients / limit)
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error.message
    });
  }
};

const getClientById = async (req, res) => {
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

const updateClient = async (req, res) => {
  try {
    const { id } = req.params
    const { firstName, lastName, email, phone, companyName, address, gstNumber, preferredPaymentMethod, riskLevel, status } = req.body

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

    const updatedClient = await Client.findByIdAndUpdate(id, updateData, { new: true })

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


export {createClient,getClients,getClientById,updateClient,deleteClient}