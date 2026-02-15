'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('announcements', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teachers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Which teacher created this announcement',
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // null = announcement for ALL students
        references: {
          model: 'classes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Which class this announcement is for (null = all students)',
      },
      target_side: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'For segregated classes: "brothers", "sisters", or null for combined/all',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Announcement title/subject',
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Announcement content',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('announcements', ['teacher_id'], {
      name: 'idx_announcements_teacher_id',
    });

    await queryInterface.addIndex('announcements', ['class_id'], {
      name: 'idx_announcements_class_id',
    });

    await queryInterface.addIndex('announcements', ['created_at'], {
      name: 'idx_announcements_created_at',
    });

    await queryInterface.addIndex('announcements', ['target_side'], {
      name: 'idx_announcements_target_side',
    });

    console.log('✅ Created announcements table with indexes');
  },

  async down(queryInterface, Sequelize) {
    // Indexes are automatically dropped when table is dropped
    await queryInterface.dropTable('announcements');
    console.log('✅ Dropped announcements table');
  }
};