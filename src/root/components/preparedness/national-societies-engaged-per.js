import React, { PureComponent } from 'react';
import { PropTypes as T } from 'prop-types';
import { environment } from '#config';
import Fold from './../fold';
import NationalSocietiesEngagedPerGraphDataFactory from './factory/national-societies-engaged-per-graph-data-factory';
import {
  PieChart, Pie, Cell
} from 'recharts';

import LanguageContext from '#root/languageContext';
import Translate from '#components/Translate';
import { regionsByIdSelector } from '../../selectors';
import connect from 'react-redux/lib/connect/connect';

class NationalSocietiesEngagedPer extends PureComponent {
  static get PIE_COLORS () {
    return ['rgba(36, 51, 76, 0.2)', '#24334c', '#FFBB28', '#FF8042'];
  }

  static get RADIAN () {
    return Math.PI / 180;
  }

  static RENDER_CUSTOMIZED_LABEL ({cx, cy, midAngle, innerRadius, outerRadius, percent, index}) {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * NationalSocietiesEngagedPer.RADIAN);
    const y = cy + radius * Math.sin(-midAngle * NationalSocietiesEngagedPer.RADIAN);

    return (
      <text x={x} y={y} fill="#24334c" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  }

  constructor (props) {
    super(props);
    this.nationalSocietiesEngagedPerGraphDataFactory = new NationalSocietiesEngagedPerGraphDataFactory();
    this.preparedData = null;
  }

  componentDidMount () {
    const { strings } = this.context;
    this.preparedData = this.nationalSocietiesEngagedPerGraphDataFactory.buildGraphData(this.props.data, this.props.regionsById, strings);
    this.forceUpdate();
  }

  render () {
    if (this.preparedData === null || this.preparedData.length === 0) {
      return null;
    }
    const charts = [];

    // Filters out data where 'region' is undefined.
    this.preparedData = this.preparedData.filter(d => d.region);

    this.preparedData.forEach((region) => {
      charts.push(
        <div key={'regionChart' + region.region.id} className='col col--preparedness-ns'>
          <div style={{margin: 'auto', width: 'fit-content'}}>
            <PieChart width={160} height={160}>
              <Pie
                data={region.data}
                cx={80}
                cy={80}
                labelLine={false}
                label={NationalSocietiesEngagedPer.RENDER_CUSTOMIZED_LABEL}
                innerRadius={30}
                outerRadius={75}
                fill="#8884d8"
                startAngle={90}
                endAngle={450}
                dataKey="value">
                {
                  region.data.map((entry, index) => {
                    return <Cell
                      key={`cell-${index}`}
                      fill={NationalSocietiesEngagedPer.PIE_COLORS[index % NationalSocietiesEngagedPer.PIE_COLORS.length]} />;
                  })
                }
              </Pie>
            </PieChart>
          </div>
          <div className='donot__label__preparedness'>{region.region.name}</div>
          <div className='donot__label__desc'>
            <Translate
              stringId='nationalSocietiesCountries'
              params={{
                value: region.data[1].value,
                total: region.data[0].value,
              }}
            />
          </div>
        </div>
      );
    });
    const { strings } = this.context;
    return (
      <div className='inner'>
        <Fold title={strings.nationalSocietiesTitle} foldTitleClass='margin-reset' foldWrapperClass='fold--main'>
          <div className='row flex-sm'>
            {charts}
          </div>
        </Fold>
      </div>
    );
  }
}

NationalSocietiesEngagedPer.contextType = LanguageContext;
if (environment !== 'production') {
  NationalSocietiesEngagedPer.propTypes = {
    data: T.object
  };
}

const selector = (state, ownProps) => ({
  regionsById: regionsByIdSelector(state)
});

const dispatcher = dispatch => ({});

export default connect(selector, dispatcher)(NationalSocietiesEngagedPer);
