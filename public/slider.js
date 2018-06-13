//import { CATEGORY } from 'ui/vis/vis_category';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
//import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

// we need to load the css ourselves
import './slider.less';
// we also need to load the controller used by the template
import './sliderController';
import optionsTemplate from './sliderOptions.html';
import template from './slider.html';

import '../node_modules/angularjs-slider/dist/rzslider.css';
import '../node_modules/angularjs-slider/dist/rzslider.min.js';

// register the provider with the visTypes registry
VisTypesRegistryProvider.register(SliderVisProvider);

function SliderVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  //const Schemas = Private(VisSchemasProvider);

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    name: 'slider',
    title: 'Slider Widget',
    icon: 'fa-sliders',
    description: 'Useful for filtering with sliders in dashboards.',
    template,
    visConfig: {
      defaults: {
        field: null,
        title: "no title",
        minValue: 0,
        maxValue: 500,
        step: 1
      },
      template: template
    },
    editorConfig: {
      optionsTemplate,
    },
    requiresSearch: true,
    responseHandler: 'none'
  });
}

// export the provider so that the visType can be required with Private()
export default SliderVisProvider;
