"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var format = require("string-format");
var React = require("react");
var Reflux = require("reflux");
var classSet = require("react-classset");
var c3 = require("c3");
var _ = require("lodash");
var moment = require("moment");
var ApiConsumerMixin = require("mozaik/browser").Mixin.ApiConsumer;


var TimeseriesChart = (function () {
  function TimeseriesChart(bindTo, opts) {
    _classCallCheck(this, TimeseriesChart);

    opts = opts || {};
    this.chart = c3.generate({
      bindto: bindTo,
      transition: {
        // Skipping transition for now
        duration: null
      },
      data: {
        labels: true,
        x: "x",
        xFormat: "%Y-%m-%d",
        columns: []
      },
      axis: {
        x: {
          type: "timeseries",
          tick: {
            format: function (x) {
              return moment(x).format("ddd D");
            },
            count: opts.tickCount
          }
        },
        y: {
          min: 0
        }
      }
    });
  }

  _prototypeProperties(TimeseriesChart, null, {
    load: {
      value: function load(data) {
        return this.chart.load(data);
      },
      writable: true,
      configurable: true
    },
    loadEntries: {
      value: function loadEntries(entries) {
        var xData = [];
        var visitsData = [];
        var sessionsData = [];
        var weekDayRegions = [];

        if (!entries || entries.length === 0) {
          console.warn("No statistics provided");
          return;
        }

        _.each(entries, function (entry) {
          //
          var entryObj = _.zipObject(["date", "views", "sessions"], entry);
          var date = moment(entryObj.date.value, "YYYYMMDD");

          // Mark Sat and Sun with region
          if (_.contains([6, 7], date.isoWeekday())) {
            var weekDayRegion = {
              start: date.format("YYYY-MM-DD"),
              end: date.format("YYYY-MM-DD")
            };
            weekDayRegions.push(weekDayRegion);
          };

          xData.push(date.format("YYYY-MM-DD"));
          visitsData.push(parseInt(entryObj.views.value, 10));
          sessionsData.push(parseInt(entryObj.sessions.value, 10));
        });

        return this.load({
          columns: [["x"].concat(xData), ["Page views"].concat(visitsData), ["Sessions"].concat(sessionsData)],
          regions: weekDayRegions
        });
      },
      writable: true,
      configurable: true
    }
  });

  return TimeseriesChart;
})();

;


var PageViews = React.createClass({
  displayName: "PageViews",
  chartClassName: "chart",
  chart: null,

  mixins: [Reflux.ListenerMixin, ApiConsumerMixin],

  propTypes: {
    id: React.PropTypes.string.isRequired
  },

  getInitialState: function getInitialState() {
    return {
      total: null,
      avg: null,
      entries: []
    };
  },

  componentDidMount: function componentDidMount() {
    var chartElement = this.getDOMNode().getElementsByClassName(this.chartClassName)[0];
    this.chart = new TimeseriesChart(chartElement, {
      min: this.props.min,
      max: this.props.max,
      tickCount: this.props.tickCount,
      dateFormat: this.props.dateFormat
    });
  },

  componentWillUnmount: function componentWillUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },

  getApiRequest: function getApiRequest() {
    var id = format("analytics.pageViews.{}", this.props.id);

    return {
      id: id,
      params: {
        id: this.props.id,
        startDate: this.props.startDate,
        endDate: this.props.endDate
      }
    };
  },

  onApiData: function onApiData(data) {
    var total = data.totalsForAllResults["ga:pageviews"] || null;
    var avg = Math.floor(total / data.totalResults, -1);

    this.setState({
      total: total,
      avg: avg,
      entries: data.results
    });

    this.chart.loadEntries(this.state.entries);
  },

  render: function render() {
    var title = this.props.title || "Analytics";
    var avg = this.state.avg || "-";
    var total = this.state.total || "-";

    var widget = React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "widget__header" },
        title,
        React.createElement(
          "span",
          { className: "widget__header__count" },
          React.createElement(
            "span",
            { className: "label" },
            "avg"
          ),
          React.createElement(
            "span",
            { className: "value" },
            avg
          ),
          React.createElement(
            "span",
            { className: "delimeter" },
            "/"
          ),
          React.createElement(
            "span",
            { className: "label" },
            "total"
          ),
          React.createElement(
            "span",
            { className: "value" },
            total
          )
        ),
        React.createElement("i", { className: "fa fa-line-chart" })
      ),
      React.createElement(
        "div",
        { className: "widget__body" },
        React.createElement("div", { className: this.chartClassName })
      )
    );

    return widget;
  }
});

module.exports = PageViews;