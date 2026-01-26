'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add UNIQUE constraint on (student_id, class_id, date)
    await queryInterface.addConstraint("attendance", {
      fields: ["student_id", "class_id", "date"],
      type: "unique",
      name: "attendance_student_class_date_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "attendance",
      "attendance_student_class_date_unique"
    );
  },
};
