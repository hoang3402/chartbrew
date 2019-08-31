import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Message, Icon, Button, Container, Header, Image
} from "semantic-ui-react";
import { Link } from "react-router-dom";

import Chart from "./Chart";
import dashboardImage from "../assets/290.png";
/*
  Description
*/
class ProjectDashboard extends Component {
  render() {
    const { connections, charts, match } = this.props;

    return (
      <div style={styles.container}>
        {connections.length === 0 && charts.length !== 0
          && (
          <Message
            floating
            warning
          >
            <Link to={`/${match.params.teamId}/${match.params.projectId}/connections`}>
              <Button primary floated="right" icon labelPosition="right">
                <Icon name="plug" />
                Connect now
              </Button>
            </Link>
            <div>
              <Icon name="database" size="big" />
              Your project is not connected to any database yet.
            </div>
          </Message>
          )}
        {connections.length === 0 && charts.length === 0
          && (
          <Container text textAlign="center" style={{ paddingTop: 50 }}>
            <Header size="huge" textAlign="center">
              <span role="img" aria-label="wave">👋</span>
              {" "}
Welcome to Chart Brew
              <Header.Subheader>
                {"Why not jump right into it? Create a new database connection and start visualizing your data. "}
              </Header.Subheader>
            </Header>
            <Image centered size="large" src={dashboardImage} alt="Chartbrew create chart" />
            <br />
            <Link to={`/${match.params.teamId}/${match.params.projectId}/connections`}>
              <Button primary icon labelPosition="right" size="huge">
                <Icon name="play" />
                Get started
              </Button>
            </Link>
          </Container>
          )}
        {connections.length > 0 && <Chart charts={charts} />}
      </div>
    );
  }
}
const styles = {
  container: {
    flex: 1,
    padding: 10,
    paddingLeft: 20,
  },
};

ProjectDashboard.propTypes = {
  connections: PropTypes.array.isRequired,
  charts: PropTypes.array.isRequired,
  match: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    connections: state.connection.data,
    charts: state.chart.data,
  };
};

const mapDispatchToProps = () => {
  return {
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ProjectDashboard);