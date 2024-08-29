const Org = require('../models/Org.js'); // Make sure to import your Org model

const addOrg = async (req, res) => {
    const { name, account, website, fuelReimbursementPolicy, speedLimitPolicy, parent } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Organization name is required' });
    }

    try {
        const existingOrg = await Org.findOne({ name });
        if (existingOrg) {
            return res.status(400).json({ message: 'Organization with this name already exists' });
        }

        const newOrg = new Org({
            name,
            account,
            website,
            fuelReimbursementPolicy: fuelReimbursementPolicy || '1000', // Default value if not provided
            speedLimitPolicy,
            parent
        });


        await newOrg.save();

        
        return res.status(201).json(newOrg);
    } catch (error) {
        console.error('Error creating organization:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};




const getAllOrgs = async (req, res) => {
  try {
    // Fetch all organizations
    const organizations = await Org.find();

    // Create a map to store organizations by their name
    const orgMap = {};
    organizations.forEach(org => {
      orgMap[org.name] = {
        _id: org._id,
        fuelReimbursementPolicy: org.fuelReimbursementPolicy,
        speedLimitPolicy: org.speedLimitPolicy,
        parent: org.parent // Store parent name
      };
    });

    // Function to resolve inherited policies for an organization
    const resolvePolicies = (orgName) => {
      const org = orgMap[orgName];
      if (!org) return { fuelReimbursementPolicy: null, speedLimitPolicy: null };

      // If there's no parent, return the organization's own policies
      if (!org.parent) {
        return {
          fuelReimbursementPolicy: org.fuelReimbursementPolicy,
          speedLimitPolicy: org.speedLimitPolicy
        };
      }

      // Resolve policies from the parent
      const parentPolicies = resolvePolicies(org.parent);

      // Return the final policies
      return {
        fuelReimbursementPolicy: org.fuelReimbursementPolicy || parentPolicies.fuelReimbursementPolicy,
        speedLimitPolicy: org.speedLimitPolicy !== null ? org.speedLimitPolicy : parentPolicies.speedLimitPolicy
      };
    };

    // Apply inheritance rules to each organization
    const result = organizations.map(org => {
      // Resolve policies considering inheritance
      const policies = resolvePolicies(org.name);

      return {
        name: org.name,
        account: org.account,
        website: org.website,
        fuelReimbursementPolicy: policies.fuelReimbursementPolicy,
        speedLimitPolicy: policies.speedLimitPolicy
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching organizations:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};



module.exports = {
    addOrg,
    getAllOrgs
};
