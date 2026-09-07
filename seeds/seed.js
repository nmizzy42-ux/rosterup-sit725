require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Workplace = require('../models/Workplace');
const Shift = require('../models/Shift');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing test data
        await Shift.deleteMany({});
        await User.deleteMany({});
        await Workplace.deleteMany({});

        const password = await bcrypt.hash('Password123!', 10);

        // Create manager
        const manager = await User.create({
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@test.com',
            password_hashed: password,
            role: 'manager',
            workplace_status: 'approved',
            active: true
        });

        // Create workplace
        const workplace = await Workplace.create({
            workplace_name: 'RosterUp Cafe',
            workplace_type: 'Hospitality',
            workplace_address: '100 Example Street',
            workplace_town: 'Melbourne',
            workplace_postcode: '3000',
            invite_code: 'ROSTER123',
            manager_id: manager._id,
            active: true
        });

        // Add workplace to manager
        manager.workplace = workplace._id;
        await manager.save();

        // Create employees
        const sarah = await User.create({
            first_name: 'Sarah',
            last_name: 'Jones',
            email: 'sarah.jones@test.com',
            password_hashed: password,
            role: 'employee',
            workplace: workplace._id,
            workplace_status: 'approved',
            active: true
        });

        const michael = await User.create({
            first_name: 'Michael',
            last_name: 'Brown',
            email: 'michael.brown@test.com',
            password_hashed: password,
            role: 'employee',
            workplace: workplace._id,
            workplace_status: 'approved',
            active: true
        });

        const emily = await User.create({
            first_name: 'Emily',
            last_name: 'Wilson',
            email: 'emily.wilson@test.com',
            password_hashed: password,
            role: 'employee',
            workplace: workplace._id,
            workplace_status: 'approved',
            active: true
        });

        // Employee awaiting workplace approval
        await User.create({
            first_name: 'James',
            last_name: 'Taylor',
            email: 'james.taylor@test.com',
            password_hashed: password,
            role: 'employee',
            workplace: workplace._id,
            workplace_status: 'pending',
            active: true
        });

        // Create realistic shifts
        await Shift.insertMany([
            {
                workplace: workplace._id,
                posted_by: sarah._id,
                shift_date: new Date('2026-09-10'),
                start_time: '09:00',
                end_time: '17:00',
                shift_role: 'Barista',
                note: 'Unable to work due to an appointment.',
                status: 'open'
            },
            {
                workplace: workplace._id,
                posted_by: michael._id,
                claimed_by: sarah._id,
                shift_date: new Date('2026-09-12'),
                start_time: '12:00',
                end_time: '20:00',
                shift_role: 'Front of House',
                note: 'Looking for someone to cover my Saturday shift.',
                status: 'pending'
            },
            {
                workplace: workplace._id,
                posted_by: sarah._id,
                claimed_by: emily._id,
                shift_date: new Date('2026-09-14'),
                start_time: '07:00',
                end_time: '15:00',
                shift_role: 'Barista',
                note: 'Morning shift.',
                status: 'covered'
            },
            {
                workplace: workplace._id,
                posted_by: emily._id,
                shift_date: new Date('2026-09-16'),
                start_time: '16:00',
                end_time: '22:00',
                shift_role: 'Front of House',
                note: 'No longer need cover.',
                status: 'cancelled'
            },
            {
                workplace: workplace._id,
                posted_by: michael._id,
                shift_date: new Date('2026-09-18'),
                start_time: '10:00',
                end_time: '18:00',
                shift_role: 'Kitchen Hand',
                note: 'Need someone to cover this shift.',
                status: 'open'
            }
        ]);

        console.log('Database seeded successfully');
        console.log(`Workplace: ${workplace.workplace_name}`);
        console.log(`Workplace ID: ${workplace._id}`);
        console.log(`Manager ID: ${manager._id}`);
        console.log('Invite code: ROSTER123');
        console.log('Test password: Password123!');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
    }
};

seedDatabase();