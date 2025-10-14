
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.sequelize.query(`
			CREATE VIEW "Usergamelog" AS
			SELECT 
				Users.id AS userId,
				COUNT(CASE WHEN Gamelogs.user1 = Users.id OR Gamelogs.user2 = Users.id THEN 1 END) AS totalGames,
				SUM(CASE WHEN Gamelogs.winner = Users.id THEN 1 ELSE 0 END) AS wins,
				SUM(CASE WHEN Gamelogs.loser = Users.id THEN 1 ELSE 0 END) AS losses,
				SUM(CASE WHEN Gamelogs.user1 = Users.id OR Gamelogs.user2 = Users.id THEN Gamelogs.duration ELSE 0 END) AS timePlayed,
				COUNT(CASE WHEN (Gamelogs.user1 = Users.id OR Gamelogs.user2 = Users.id) AND (Gamelogs.tournament_id IS NOT NULL) THEN 1 END) AS tournamentsPlayed,
				SUM(CASE WHEN Gamelogs.winner = Users.id AND Gamelogs.tournament_id IS NOT NULL THEN 1 ELSE 0 END) AS winsInTournaments,
				SUM(CASE WHEN Gamelogs.loser = Users.id AND Gamelogs.tournament_id IS NOT NULL THEN 1 ELSE 0 END) AS lossesInTournaments
			FROM "Users"
			LEFT JOIN "Gamelogs" ON Users.id = Gamelogs.user1 OR Users.id = Gamelogs.user2
			GROUP BY Users.id;
	  `);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.sequelize.query(`DROP VIEW IF EXISTS "Usergamelog";`);
	}
};

// docker exec -it backend bash && cd ./database && npx sequelize-cli db:migrate
// docker exec -it backend bash && cd ./database && npx sequelize-cli db:migrate:undo
