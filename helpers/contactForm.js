var Admin = require('../modals/admin')
const Order = require('../modals/orderSchema')
const Product = require('../modals/product')
const Cart = require('../modals/cartschema')
const Contact = require('../modals/contactSchema')

module.exports = {

    contactform:async (userid, data) => {
        try {
            // Create a new contact document
            const contact = new Contact({
                userId: userid,
                name: data.name,
                email: data.email,
                subject: data.subject,
                telephone: data.telephone,
                message: data.message
            });
    



            

            // Save the contact to the database
            const result = await contact.save();
            return result;
        } catch (error) {
            console.error('Error saving contact data:', error);
            throw error;
        }
}
}