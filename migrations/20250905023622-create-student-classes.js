'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('student_classes', {
      fields: ['studentId', 'classId'],
      type: 'unique',
      name: 'unique_student_class_pair'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('student_classes', 'unique_student_class_pair');
  }
};
