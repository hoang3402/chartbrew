const simplecrypt = require("simplecrypt");
const uuidv4 = require("uuid/v4");

const Team = require("../models/Team");
const TeamRole = require("../models/TeamRole");
const User = require("../models/User");
const Project = require("../models/Project");
const TeamInvite = require("../models/TeamInvintation");
const UserController = require("./UserController");

const settings = process.env.NODE_ENV === "production" ? require("../settings") : require("../settings-dev");

const sc = simplecrypt({
  password: settings.secret,
  salt: "10",
});

class TeamController {
  constructor() {
    this.team = Team;
    this.teamRole = TeamRole;
    this.teamInvite = TeamInvite;
    this.user = User;
    this.userController = new UserController();
  }

  // create a new team
  createTeam(data) {
    return this.team.create({ "name": data.name })
      .then((team) => {
        return team;
      }).catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  deleteTeam(id) {
    return this.team.destroy({ where: { id } })
      .then(() => {
        return true;
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  // add a new team role
  addTeamRole(teamId, userId, roleName) {
    return this.teamRole.create({ "team_id": teamId, "user_id": userId, "role": roleName })
      .then((role) => {
        return role;
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  getTeamRole(teamId, userId) {
    return this.teamRole.findOne({
      where: {
        team_id: teamId,
        user_id: userId,
      },
    })
      .then((role) => {
        return role;
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  getAllTeamRoles(teamId) {
    return this.teamRole.findAll({
      where: { team_id: teamId }
    })
      .then((roles) => {
        return roles;
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  getTeamMembersId(teamId) {
    return this.teamRole.findAll({
      where: { team_id: teamId }
    }).then((teamRoles) => {
      const userIds = [];
      teamRoles.forEach((role) => {
        userIds.push(role.user_id);
      });
      return userIds;
    }).catch((error) => {
      return new Promise((resolve, reject) => reject(error));
    });
  }

  updateTeamRole(teamId, userId, newRole) {
    return this.teamRole.update({ role: newRole }, { where: { "team_id": teamId, "user_id": userId } })
      .then(() => {
        return this.getTeamRole(teamId, userId);
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  deleteTeamMember(id) {
    let teamId;
    return this.teamRole.findByPk(id)
      .then((role) => {
        teamId = role.team_id;
        return this.teamRole.destroy({ where: { id } });
      })
      .then(() => {
        return this.getAllTeamRoles(teamId);
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }


  isUserInTeam(teamId, email) {
    // checking if a user is already in the team
    const idsArray = [];
    return this.user.findOne({ where: { "email": sc.encrypt(email) } })
      .then((invitedUser) => {
        if (!invitedUser) return [];
        return this.teamRole.findAll({ where: { "user_id": invitedUser.id } })
          .then((teamRoles) => {
            if (teamRoles.length < 1) return [];
            teamRoles.forEach((teamRole) => {
              if (teamRole.team_id === parseInt(teamId, 0)) idsArray.push(teamRole.team_id);
            });
            return idsArray;
          });
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error.message));
      });
  }

  findById(id) {
    return this.team.findOne({
      where: { id },
      include: [{ model: TeamRole }, { model: Project }],
    })
      .then((team) => {
        if (!team) return new Promise((resolve, reject) => reject(new Error(404)));

        return team;
      }).catch((error) => {
        return new Promise((resolve, reject) => reject(error.message));
      });
  }

  update(id, data) {
    return this.team.update(data, { where: { "id": id } })
      .then(() => {
        return this.findById(id);
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  getUserTeams(userId) {
    return this.teamRole.findAll({ where: { user_id: userId } })
      .then((teamIds) => {
        const idsArray = [];
        teamIds.forEach((role) => {
          idsArray.push(role.team_id);
        });
        if (idsArray < 1) return new Promise(resolve => resolve([]));
        return this.team.findAll({
          where: { id: idsArray },
          include: [{ model: TeamRole }, { model: Project }]
        });
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  saveTeamInvite(teamId, data) {
    const token = uuidv4();
    return this.teamInvite.create({
      "team_id": teamId, "email": data.email, "user_id": data.user_id, token
    })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  getTeamInvite(token) {
    return this.teamInvite.findOne({ where: { token } })
      .then((invite) => {
        if (!invite) return new Promise((resolve, reject) => reject(new Error(404)));
        return invite;
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error.message));
      });
  }

  getTeamInvitesById(teamId) {
    return this.teamInvite.findAll({
      where: { team_id: teamId },
      include: [{ model: Team }],
    })
      .then((invites) => {
        return invites;
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }

  getInviteByEmail(teamId, email) {
    return this.teamInvite.findOne({
      where: { team_id: teamId, email: sc.encrypt(email) },
      include: [{ model: Team }],
    })
      .then((foundInvite) => {
        return foundInvite;
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject((error.message)));
      });
  }

  deleteTeamInvite(token) {
    return this.teamInvite.destroy({ where: { token } })
      .then(() => {
        return true;
      })
      .catch((error) => {
        return new Promise((resolve, reject) => reject(error));
      });
  }
}

module.exports = TeamController;