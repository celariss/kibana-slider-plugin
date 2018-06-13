//import _ from 'lodash';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { IndexedArray } from 'ui/indexed_array';
import { buildRangeFilter } from 'ui/filter_manager/lib/range';
//import { angular } from 'angular';
import { uiModules } from 'ui/modules';
// get the kibana/metric_vis module, and make sure that it requires the 'kibana' module if it
// didn't already
const module = uiModules.get('kibana/kibana-slider-plugin', ['kibana', 'rzModule']);


module.controller('KbnSliderVisController', function ($scope, $element, $rootScope, Private, $filter) {
  const queryFilter = Private(FilterBarQueryFilterProvider);

  $rootScope.plugin = {
    sliderPlugin: {}
  };
  $scope.config = {
    filterType: 'range',
    selectedField: $scope.vis.params.selectedField,
    title: $scope.vis.params.title,
    icon: '',
    slider: {
      min: $scope.vis.params.minValue,
      max: $scope.vis.params.maxValue,
      options: {
        floor: $scope.vis.params.minValue,
        ceil: $scope.vis.params.maxValue,
        step: $scope.vis.params.step,
        precision: 2,
        onEnd: function (sliderId, modelValue, highValue) {
          if ($scope.config.selectedField) {
            $scope.filter({ gte: modelValue, lte: highValue });
          }
        }
      }
    }
  };

  // we want to be able to cancel the new filter in case it gives no results
  var previousFilterRange = null;

  // where range = {gte: minValue, lte: maxValue}
  $scope.filter = function (range) {
    const currentFilter = $scope.findFilter();

    if(currentFilter) {
      previousFilterRange = currentFilter.meta.params;
      queryFilter.removeFilter(currentFilter);
    }
    else
      previousFilterRange = null;

    const fieldName = $scope.config.selectedField;
    if(fieldName && fieldName.length > 0 && range) {
      const rangeFilter = buildRangeFilter({ name: fieldName },
        range,
        $scope.vis.indexPattern);
      queryFilter.addFilters(rangeFilter);
    }
  };

  $scope.findFilter = function () {
    const filters = queryFilter.getFilters();
    const fieldName = $scope.config.selectedField;
    const matchingFilter = filters.find(function (f) {
      return f.meta.key === fieldName;
    });
    return matchingFilter;
  };

  $scope.$watch('vis.params.field', function (field) {
    if (field) {
      $scope.config.selectedField = field.name;
    }
  });
  $scope.$watch('vis.params.minValue', function (minValue) {
    if (minValue) {
      $scope.config.slider.options.floor = minValue;
      $scope.config.slider.min = minValue;
    }
  });
  $scope.$watch('vis.params.maxValue', function (maxValue) {
    if (maxValue) {
      $scope.config.slider.options.ceil = maxValue;
      $scope.config.slider.max = maxValue;
    }
  });
  $scope.$watch('vis.params.step', function (step) {
    if (step) {
      $scope.config.slider.options.step = step;
    }
  });
  $scope.$watch('vis.params.title', function (title) {
    $scope.config.title = title;
  });
  $scope.$watch('vis.params.icon', function (icon) {
    $scope.config.icon = icon;
  });

  $scope.getIndexedNumberFields = function () {
    let fields = $scope.vis.indexPattern.fields.raw;
    const fieldTypes = ['number'];

    if (fieldTypes) {
      fields = $filter('fieldType')(fields, fieldTypes);
      fields = $filter('filter')(fields, {});
      fields = $filter('orderBy')(fields, ['type', 'name']);
    }

    return new IndexedArray({
      index: ['name'],
      initialSet: fields
    });
  };

  $scope.$watch('esResponse', function (resp) {
    if (resp.hits.total==0) {
      // If the response doesn't show any value, we cancel current filter to prevent the slider from disappearing
      if (previousFilterRange) {
        $scope.config.slider.min = previousFilterRange.gte;
        $scope.config.slider.max = previousFilterRange.lte;
      }
      else {
        $scope.config.slider.min = $scope.config.slider.options.floor;
        $scope.config.slider.max = $scope.config.slider.options.ceil;
      }

      $scope.filter(previousFilterRange);
    }
  });

  $rootScope.plugin.sliderPlugin.indexedFields = $scope.getIndexedNumberFields();
});