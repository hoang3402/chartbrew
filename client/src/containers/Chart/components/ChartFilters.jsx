import React, { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { Calendar } from "react-date-range";
import { enGB } from "date-fns/locale";
import { format, formatISO } from "date-fns";
import {
  Button, Dropdown, Spacer, Input, DropdownTrigger, DropdownMenu, DropdownItem,
} from "@nextui-org/react";
import { Calendar as CalendarIcon, CloseSquare, TickSquare } from "react-iconly";

import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file

import { secondary } from "../../../config/colors";
import determineType from "../../../modules/determineType";
import * as operations from "../../../modules/filterOperations";
import Text from "../../../components/Text";
import Container from "../../../components/Container";
import Row from "../../../components/Row";

function ChartFilters(props) {
  const {
    chart, onAddFilter, onClearFilter, conditions,
  } = props;

  const [calendarOpen, setCalendarOpen] = useState("");
  const [optionFilter, setOptionFilter] = useState({});

  const _getDropdownOptions = (dataset, condition) => {
    const conditionOpt = dataset.conditions.find((c) => c.field === condition.field);

    if (!conditionOpt || !conditionOpt.values) return [];

    return conditionOpt.values.map((v) => {
      const isBoolean = determineType(v) === "boolean";
      return {
        key: v,
        value: isBoolean || v === null ? `${v}` : v,
        text: isBoolean || v === null ? `${v}` : v,
      };
    });
  };

  const _onOptionSelected = (value, condition) => {
    setCalendarOpen("");
    if (!value) onClearFilter(condition);
    else onAddFilter({ ...condition, value });
  };

  const _getConditionValue = (conditionId) => {
    const condition = conditions.find((c) => c.id === conditionId);
    if (!condition) return null;

    return condition.value;
  };

  const _checkIfFilters = () => {
    let filterCount = 0;
    chart.Datasets.forEach((d) => {
      if (d.conditions) {
        filterCount += d.conditions.filter((c) => c.exposed).length;
      }
    });

    return filterCount;
  };

  const _getFilteredOptions = (filterOptions, cId) => {
    if (!optionFilter[cId]) return filterOptions;

    return filterOptions
      .filter((o) => o.text
        && o.text.toString().toLowerCase()?.includes(optionFilter[cId].toLowerCase()));
  };

  return (
    <div>
      <Container className={"pl-0 pr-0"}>
        {!_checkIfFilters() && (
          <Row>
            <p>No filters available</p>
          </Row>
        )}
        {chart
          && chart.Datasets.filter((d) => d.conditions && d.conditions.length)
            .map((dataset) => {
              return dataset.conditions.filter((c) => c.exposed).map((condition) => {
                const filterOptions = _getDropdownOptions(dataset, condition);
                return (
                  <Fragment key={condition.id}>
                    <Row align="center">
                      <div>
                        <Row align="center">
                          <Text b>
                            {condition.displayName || condition.field.substring(condition.field.lastIndexOf(".") + 1)}
                          </Text>
                          <Spacer x={0.5} />
                          <Text>
                            {operations
                              .operators?.find((o) => condition.operator === o.value)?.text}
                          </Text>
                        </Row>
                        <Spacer y={0.5} />
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {condition.type !== "date" && !condition.hideValues && (
                            <Dropdown>
                              <DropdownTrigger type="text">
                                <Input
                                  type="text"
                                  value={
                                    optionFilter[condition.id]
                                    || _getConditionValue(condition.id)
                                  }
                                  placeholder="Enter a value or search"
                                  onChange={(e) => {
                                    setOptionFilter({
                                      ...optionFilter, [condition.id]: e.target.value
                                    });
                                  }}
                                  variant="bordered"
                                  size="sm"
                                  endContent={(
                                    <Button
                                      auto
                                      startContent={<TickSquare />}
                                      color="success"
                                      size="sm"
                                      className={"min-w-fit"}
                                      variant="flat"
                                      onClick={() => {
                                        _onOptionSelected(optionFilter[condition.id], condition);
                                      }}
                                    />
                                  )}
                                />
                              </DropdownTrigger>
                              <DropdownMenu
                                variant="bordered"
                                selectedKeys={[`${_getConditionValue(condition.id)}`]}
                                onSelectionChange={(selection) => {
                                  _onOptionSelected(Object.values(selection)[0], condition);
                                  setOptionFilter({
                                    ...optionFilter, [condition.id]: ""
                                  });
                                }}
                                selectionMode="single"
                                className="min-w-max"
                              >
                                {_getFilteredOptions(filterOptions, condition.id).map((opt) => (
                                  <DropdownItem key={opt.value}>
                                    {opt.text}
                                  </DropdownItem>
                                ))}
                              </DropdownMenu>
                            </Dropdown>
                          )}
                          {condition.type !== "date" && condition.hideValues && (
                            <Input
                              type="text"
                              value={
                                optionFilter[condition.id]
                                || _getConditionValue(condition.id)
                              }
                              placeholder="Enter a value here"
                              onChange={(e) => {
                                setOptionFilter({
                                  ...optionFilter, [condition.id]: e.target.value
                                });
                              }}
                              variant="bordered"
                              size="sm"
                              endContent={(
                                <Button
                                  auto
                                  startContent={<TickSquare />}
                                  color="success"
                                  size="sm"
                                  className="min-w-fit"
                                  variant="flat"
                                  onClick={() => {
                                    _onOptionSelected(optionFilter[condition.id], condition);
                                  }}
                                />
                              )}
                            />
                          )}
                          {condition.type === "date" && calendarOpen !== condition.id && (
                            <>
                              <Button
                                variant="bordered"
                                startContent={<CalendarIcon />}
                                onClick={() => setCalendarOpen(condition.id)}
                                auto
                                size="sm"
                              >
                                {(_getConditionValue(condition.id) && format(new Date(_getConditionValue(condition.id)), "Pp", { locale: enGB })) || "Select a date"}
                              </Button>
                              <Spacer x={0.5} />
                              {_getConditionValue(condition.id) && (
                                <Button
                                  variant="light"
                                  isIconOnly
                                  onClick={() => _onOptionSelected("", condition)}
                                  auto
                                >
                                  <CloseSquare />
                                </Button>
                              )}
                            </>
                          )}
                          {condition.type === "date" && calendarOpen === condition.id && (
                            <div>
                              <Calendar
                                date={(
                                  _getConditionValue(condition.id)
                                  && new Date(_getConditionValue(condition.id))
                                )
                                  || new Date()}
                                onChange={(date) => _onOptionSelected(formatISO(date), condition)}
                                locale={enGB}
                                color={secondary}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Row>
                    <Spacer y={1} />
                  </Fragment>
                );
              });
            })}
      </Container>
    </div>
  );
}

ChartFilters.propTypes = {
  chart: PropTypes.object.isRequired,
  onAddFilter: PropTypes.func.isRequired,
  onClearFilter: PropTypes.func.isRequired,
  conditions: PropTypes.array,
};

ChartFilters.defaultProps = {
  conditions: [],
};

export default ChartFilters;