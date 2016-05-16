"use strict";

var React = require("react");
var Reflux = require("reflux");
var classSet = require("react-classset");
var c3 = require("c3");
var _ = require("lodash");
var moment = require("moment");
var ApiConsumerMixin = require("mozaik/browser").Mixin.ApiConsumer;


var TopPages = React.createClass({
  displayName: "TopPages",
  mixins: [Reflux.ListenerMixin, ApiConsumerMixin],

  propTypes: {
    id: React.PropTypes.string.isRequired
  },

  getInitialState: function getInitialState() {
    return {
      entries: []
    };
  },

  getApiRequest: function getApiRequest() {
    var id = "analytics.topPages";

    return {
      id: id,
      params: {
        id: this.props.id,
        dimensions: this.props.dimensions,
        startDate: this.props.startDate,
        endDate: this.props.endDate
      }
    };
  },

  onApiData: function onApiData(data) {
    this.setState({
      entries: data.results
    });
  },

  render: function render() {
    var title = this.props.title || "Analytics";
    var avg = this.state.avg || "-";
    var total = this.state.total || "-";

    var entries = _.map(this.state.entries, function (entry) {
      var entryObj = _.zipObject(["pagePath", "pageViews", "avgTimeOnPage"], entry);
      return React.createElement(
        "li",
        null,
        React.createElement(
          "span",
          { className: "path" },
          entryObj.pagePath.value
        ),
        React.createElement(
          "span",
          { className: "delimeter" },
          "-"
        ),
        React.createElement(
          "span",
          { className: "value" },
          entryObj.pageViews.value
        )
      );
    });

    var widget = React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "widget__header" },
        title,
        React.createElement("i", { className: "fa fa-line-chart" })
      ),
      React.createElement(
        "div",
        { className: "widget__body analytics__top_pages" },
        React.createElement(
          "ol",
          null,
          entries
        )
      )
    );

    return widget;
  }
});

module.exports = TopPages;