'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teacher_push_tokens', {
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
      },
      push_token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      platform: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex('teacher_push_tokens', ['teacher_id'], {
      name: 'idx_teacher_push_tokens_teacher_id',
    });

    await queryInterface.addIndex('teacher_push_tokens', ['push_token'], {
      name: 'idx_teacher_push_tokens_push_token',
    });

    console.log('✅ Created teacher_push_tokens table');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('teacher_push_tokens');
    console.log('✅ Dropped teacher_push_tokens table');
  }
};