import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'


const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },

    lastName: {
      type: String,
      required: true
    },

    email: {
     type: String,
     required: true,
     lowercase: true,
     match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    businessName: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    businessType: {
      type: String,
      enum: ['freelancer', 'agency', 'startup', 'service'],
      default: 'freelancer'
    },

    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    
    gstNumber: String,
    bankAccountNumber: String,
    ifscCode: String,
    
    preferences: {
      invoiceCurrency: {
        type: String,
        default: 'INR'
      },
      invoicePrefix: {
        type: String,
        default: 'INV'
      },
      defaultPaymentTerms: {
        type: String,
        default: 'Net 30'
      },
      defaultTaxRate: {
        type: Number,
        default: 18
      }
    },
    
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
      },
      status: {
        type: String,
        default: 'active'
      },
      startDate: {
        type: Date,
        default: Date.now
      }
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
  },
  {
    timestamps: true
  }
)

userSchema.index({ email: 1 }, { unique: true })

userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (error) {
    throw error
  }
})

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`
}

export default mongoose.model('User', userSchema)



//useSchema Architecure
// schema definition
//check password modification
// password hashing  
//password comparing
//export
