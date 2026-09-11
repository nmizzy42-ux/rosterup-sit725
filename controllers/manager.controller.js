const User = require('../models/User');

//GET /api/manager/pending-employees
exports.getPendingEmployees = async (req, res) => {
    try {
        //Find all active employees whose workplace status is currently pending
        const pendingEmployees = await User.find({
            role: 'employee',
            workplace_status: 'pending',
            active: true
        }).select('first_name last_name email role workplace_status');

        return res.status(200).json({
            success: true,
            count: pendingEmployees.length,
            employees: pendingEmployees
        });
    } catch (error) {
        console.error("Fetch Pending Employees Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching pending requests.",
            error: error.message
        });
    }
};

//PATCH /api/manager/process-employee/:id
exports.processEmployeeRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // Expecting either 'approve' or 'reject'

        if (!action || (action !== 'approve' && action !== 'reject')) {
            return res.status(400).json({
                success: false,
                message: "Invalid action. System requires 'approve' or 'reject'."
            });
        }

        const employee = await User.findById(id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee request record not found."
            });
        }

        const fullName = `${employee.first_name} ${employee.last_name}`;

        if (action === 'approve') {
            employee.workplace_status = 'approved';
            await employee.save();
        } else if (action === 'reject') {
            //Keep document record but mark rejected
            employee.workplace_status = 'rejected';
            employee.active = false; // Soft-disable access profile
            await employee.save();

            // Option B (Alternative): deleting rejected requests completely:
            // await User.findByIdAndDelete(id);
        }

        return res.status(200).json({
            success: true,
            message: `Employee request successfully ${action}d.`,
            employeeName: fullName,
            action: action
        });

    } catch (error) {
        console.error("Process Employee Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error updating employee status.",
            error: error.message
        });
    }
};
