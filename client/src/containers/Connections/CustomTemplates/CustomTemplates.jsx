import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Button, Card, Spacer, CircularProgress, CardHeader, CardBody, CardFooter, Divider,
} from "@nextui-org/react";
import moment from "moment";
import { LuBarChart3 } from "react-icons/lu";

import CreateTemplateForm from "../../../components/CreateTemplateForm";
import CustomTemplateForm from "./CustomTemplateForm";
import { deleteTemplate as deleteTemplateAction } from "../../../actions/template";
import Text from "../../../components/Text";
import Row from "../../../components/Row";

function CustomTemplates(props) {
  const {
    loading, templates, teamId, projectId, onComplete, isAdmin, deleteTemplate,
    onCreateProject,
  } = props;

  const [createTemplate, setCreateTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const _getUpdatedTime = (updatedAt) => {
    if (moment().diff(moment(updatedAt), "hours") < 24) {
      return moment(updatedAt).calendar();
    }

    return moment(updatedAt).fromNow();
  };

  const _onDelete = (templateId) => {
    return deleteTemplate(teamId, templateId)
      .then(() => setSelectedTemplate(null));
  };

  if (loading) {
    return (
      <CircularProgress aria-label="Loading">
        Loading templates...
      </CircularProgress>
    );
  }

  if (templates.length === 0) {
    return (
      <div>
        <Row>
          <Text size="h4">No custom templates yet</Text>
        </Row>
        <Row>
          <Text>{"You can create custom templates from any project with data source connections and charts."}</Text>
        </Row>
        <Spacer y={1} />
        {projectId && (
          <Row>
            <Button
              color="primary"
              onClick={() => setCreateTemplate(true)}
            >
              Create a new template from this project
            </Button>
          </Row>
        )}

        <CreateTemplateForm
          teamId={teamId}
          projectId={projectId}
          visible={createTemplate}
          onClose={() => setCreateTemplate(false)}
        />
      </div>
    );
  }

  if (selectedTemplate) {
    return (
      <CustomTemplateForm
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
        projectId={projectId}
        onComplete={onComplete}
        isAdmin={isAdmin}
        onDelete={(id) => _onDelete(id)}
        onCreateProject={onCreateProject}
      />
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {templates && templates.map((template) => (
        <div className="col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-4" key={template.id}>
          <Card
            onClick={() => setSelectedTemplate(template)}
            isHoverable
            isPressable
            className="w-[230px] border-1 border-solid border-content3"
            shadow="none"
          >
            <CardHeader>
              <Text b>{template.name}</Text>
            </CardHeader>
            <Divider />
            <CardBody>
              <Row>
                <LuBarChart3 />
                <Spacer x={0.5} />
                <Text>{`${template.model.Charts.length} charts`}</Text>
              </Row>
            </CardBody>
            <Divider />
            <CardFooter>
              <span className="text-sm">{`Updated ${_getUpdatedTime(template.updatedAt)}`}</span>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
}

CustomTemplates.propTypes = {
  templates: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  teamId: PropTypes.string.isRequired,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onComplete: PropTypes.func.isRequired,
  deleteTemplate: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  onCreateProject: PropTypes.func,
};

CustomTemplates.defaultProps = {
  loading: false,
  isAdmin: false,
  projectId: "",
  onCreateProject: () => {},
};

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => {
  return {
    deleteTemplate: (teamId, templateId) => dispatch(deleteTemplateAction(teamId, templateId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomTemplates);
