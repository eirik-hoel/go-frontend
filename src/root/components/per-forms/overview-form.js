
import {
  sendPerForm,
  getPerDocument,
  getPerDraftDocument,
  sendPerDraft,
  editPerDocument,
  getPerOverviewForm,
  sendPerOverview
} from '#actions';
import { connect } from 'react-redux';
import { environment } from '#config';
import { PropTypes as T } from 'prop-types';
import React from 'react';
import c from 'classnames';
import { Link, Redirect } from 'react-router-dom';
import { showAlert } from '../system-alerts';
import Translate from '#components/Translate';

const assessmentTypes = [
  'Self assessment',
  'Simulation',
  'Operation',
  'Post operational'
];

class OverviewForm extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      data: {
        facilitator_phone: '',
        focus: ''
      },
      redirect: false
    };
    this.submitForm = this.submitForm.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.loadedDraft = null;
    this.sendInProgress = false;
  }

  componentDidMount () {
    window.scrollTo(0, 0);
    this.sendInProgress = false;
    if (this.props.view) {
      this.props._getPerOverviewForm(null, this.props.formId);
    } else {
      const filters = {};
      filters.user = this.props.user.data.id;
      filters.code = 'overview';
      filters.country = this.props.nationalSociety;
      this.props._getPerDraftDocument(filters);
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (this.props.getPerDraftDocument.fetched !== nextProps.getPerDraftDocument.fetched && nextProps.getPerDraftDocument.data.count === 1) {
      this.loadedDraft = JSON.parse(nextProps.getPerDraftDocument.data.results[0].data.replace(/'/g, '"'));
    }
  }

  componentDidUpdate () {
    if (this.loadedDraft !== null && !this.sendInProgress) {
      this.loadDraft();
    }
  }

  onFieldChange (field, e) {
    let data = Object.assign({}, this.state.data, {[field]: e.target.value});
    this.setState({data});
  }

  allowSubmit () {
    return (this.state.data.facilitator_phone && this.state.data.focus) ||
    (this.loadedDraft && this.loadedDraft.facilitator_phone && this.loadedDraft.focus);
  }

  submitForm () {
    this.sendInProgress = true;
    const builtFormData = {
      country_id: parseInt(this.props.nationalSociety),
      user_id: this.props.user.data.id,
      type_of_capacity_assessment: parseInt(document.getElementsByName('capacity_assessment_type')[0].value),
      branch_involved: document.getElementsByName('branch_involved')[0].value,
      focal_point_name: document.getElementsByName('focal_point_name')[0].value,
      focal_point_email: document.getElementsByName('focal_point_email')[0].value,
      had_previous_assessment: document.getElementsByName('prev_capacity_assessment')[0].value,
      focus: document.getElementsByName('focus')[0].value,
      facilitated_by: document.getElementsByName('facilitated_by')[0].value,
      facilitator_email: document.getElementsByName('facilitator_email')[0].value,
      phone_number: document.getElementsByName('facilitator_phone')[0].value,
      skype_address: document.getElementsByName('facilitator_skype')[0].value,
      date_of_current_capacity_assessment: document.getElementsByName('date_of_current_assessment_year')[0].value + '-' + document.getElementsByName('date_of_current_assessment_month')[0].value + '-' + document.getElementsByName('date_of_current_assessment_day')[0].value + ' 00:00:00.00+00',
      date_of_mid_term_review: document.getElementsByName('date_of_mid_review_year')[0].value + '-' + document.getElementsByName('date_of_mid_review_month')[0].value + '-' + document.getElementsByName('date_of_mid_review_day')[0].value + ' 00:00:00.00+00',
      approximate_date_next_capacity_assmt: document.getElementsByName('date_of_next_assessment_year')[0].value + '-' + document.getElementsByName('date_of_next_assessment_month')[0].value + '-' + document.getElementsByName('date_of_next_assessment_day')[0].value + ' 00:00:00.00+00',
      date_of_last_capacity_assessment: document.getElementsByName('date_of_last_assessment_year')[0].value + '-' + document.getElementsByName('date_of_last_assessment_month')[0].value + '-' + document.getElementsByName('date_of_last_assessment_day')[0].value + ' 00:00:00.00+00',
      type_of_last_capacity_assessment: parseInt(document.getElementsByName('type_of_last_assessment')[0].value)
    };

    this.props._sendPerOverview(builtFormData);
    showAlert('success', <p>Overview form has been saved successfully!</p>, true, 2000);
    this.setState({redirect: true});
  }

  buildDraftData () {
    return {
      country_id: parseInt(this.props.nationalSociety),
      user_id: this.props.user.data.id,
      name: 'overview',
      submitted_at: new Date().toISOString(),
      type_of_capacity_assessment: parseInt(document.getElementsByName('capacity_assessment_type')[0].selectedIndex),
      branch_involved: document.getElementsByName('branch_involved')[0].value,
      focal_point_name: document.getElementsByName('focal_point_name')[0].value,
      focal_point_email: document.getElementsByName('focal_point_email')[0].value,
      had_previous_assessment: document.getElementsByName('prev_capacity_assessment')[0].selectedIndex,
      focus: document.getElementsByName('focus')[0].value,
      facilitated_by: document.getElementsByName('facilitated_by')[0].value,
      facilitator_email: document.getElementsByName('facilitator_email')[0].value,
      facilitator_phone: document.getElementsByName('facilitator_phone')[0].value,
      skype_address: document.getElementsByName('facilitator_skype')[0].value,

      date_of_current_assessment_year: document.getElementsByName('date_of_current_assessment_year')[0].selectedIndex,
      date_of_current_assessment_month: document.getElementsByName('date_of_current_assessment_month')[0].selectedIndex,
      date_of_current_assessment_day: document.getElementsByName('date_of_current_assessment_day')[0].selectedIndex,

      date_of_last_assessment_year: document.getElementsByName('date_of_last_assessment_year')[0].selectedIndex,
      date_of_last_assessment_month: document.getElementsByName('date_of_last_assessment_month')[0].selectedIndex,
      date_of_last_assessment_day: document.getElementsByName('date_of_last_assessment_day')[0].selectedIndex,

      date_of_mid_review_year: document.getElementsByName('date_of_mid_review_year')[0].selectedIndex,
      date_of_mid_review_month: document.getElementsByName('date_of_mid_review_month')[0].selectedIndex,
      date_of_mid_review_day: document.getElementsByName('date_of_mid_review_day')[0].selectedIndex,

      date_of_next_assessment_year: document.getElementsByName('date_of_next_assessment_year')[0].selectedIndex,
      date_of_next_assessment_month: document.getElementsByName('date_of_next_assessment_month')[0].selectedIndex,
      date_of_next_assessment_day: document.getElementsByName('date_of_next_assessment_day')[0].selectedIndex,
      type_of_last_assessment: document.getElementsByName('type_of_last_assessment')[0].selectedIndex
    };
  }

  saveDraft () {
    const builtFormData = this.buildDraftData();
    this.loadedDraft = builtFormData;
    const finalRequest = {code: 'overview', user_id: this.props.user.data.id + '', data: builtFormData, country_id: this.props.nationalSociety};
    showAlert('success', <p>Overview form has been saved successfully!</p>, true, 2000);
    this.props._sendPerDraft(finalRequest);
  }

  loadDraft () {
    const data = this.loadedDraft;
    document.getElementsByName('capacity_assessment_type')[0].selectedIndex = data.type_of_capacity_assessment;
    document.getElementsByName('branch_involved')[0].value = data.branch_involved;
    document.getElementsByName('focal_point_name')[0].value = data.focal_point_name;
    document.getElementsByName('focal_point_email')[0].value = data.focal_point_email;
    document.getElementsByName('prev_capacity_assessment')[0].selectedIndex = data.had_previous_assessment;
    document.getElementsByName('focus')[0].value = data.focus;
    document.getElementsByName('facilitated_by')[0].value = data.facilitated_by;
    document.getElementsByName('facilitator_email')[0].value = data.facilitator_email;
    document.getElementsByName('facilitator_phone')[0].value = data.facilitator_phone;
    document.getElementsByName('facilitator_skype')[0].value = data.skype_address;

    document.getElementsByName('date_of_current_assessment_year')[0].selectedIndex = data.date_of_current_assessment_year;
    document.getElementsByName('date_of_current_assessment_month')[0].selectedIndex = data.date_of_current_assessment_month;
    document.getElementsByName('date_of_current_assessment_day')[0].selectedIndex = data.date_of_current_assessment_day;

    document.getElementsByName('date_of_last_assessment_year')[0].selectedIndex = data.date_of_last_assessment_year;
    document.getElementsByName('date_of_last_assessment_month')[0].selectedIndex = data.date_of_last_assessment_month;
    document.getElementsByName('date_of_last_assessment_day')[0].selectedIndex = data.date_of_last_assessment_day;

    document.getElementsByName('date_of_mid_review_year')[0].selectedIndex = data.date_of_mid_review_year;
    document.getElementsByName('date_of_mid_review_month')[0].selectedIndex = data.date_of_mid_review_month;
    document.getElementsByName('date_of_mid_review_day')[0].selectedIndex = data.date_of_mid_review_day;

    document.getElementsByName('date_of_next_assessment_year')[0].selectedIndex = data.date_of_next_assessment_year;
    document.getElementsByName('date_of_next_assessment_month')[0].selectedIndex = data.date_of_next_assessment_month;
    document.getElementsByName('date_of_next_assessment_day')[0].selectedIndex = data.date_of_next_assessment_day;

    document.getElementsByName('type_of_last_assessment')[0].selectedIndex = data.type_of_last_assessment;
  }

  resetForm () {
    var container, inputs, index;
    // Get the container element
    container = document.getElementById('overview__form');

    // Find its child `input` elements
    inputs = container.getElementsByTagName('input');

    for (index = 0; index < inputs.length; ++index) {
      inputs[index].value = '';
    }

    this.loadedDraft = null;
    this.setState(() => {
      return {
        data: {
          facilitator_phone: '',
          focus: ''
        }
      };
    });
  }

  render () {
    if (this.state.redirect) {
      return <Redirect to='/account' />;
    }
    if (this.props.view) {
      if (!this.props.perOverviewForm.fetched) return null;
      return (
        <React.Fragment>
          <Link to='/account#per-forms' className='button button--medium button--primary-filled' style={{float: 'right', marginBottom: '1rem'}}>
            <Translate stringId='overviewFormExit'/>
          </Link>
          <div className='fold'>
            <div className='inner'>

              <div className="fold__header">
                <h2 className="fold__title">
                  <Translate stringId='overviewFormHeading'/>
                </h2>
              </div>
              <div style={{clear: 'both'}}></div>

              <div>
                <div className='per_form_ns'>
                  <Translate stringId='overviewFormGeneralInfo'/>
                </div>
                <Translate stringId='overviewFormNationalSociety'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].country.society_name === null ? '' : this.props.perOverviewForm.data.results[0].country.society_name} /><br /><br />
                <Translate stringId='overviewFormStartDate'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].date_of_current_capacity_assessment === null ? '' : this.props.perOverviewForm.data.results[0].date_of_current_capacity_assessment} /><br /><br />
                <Translate stringId='overviewFormTypeCapacityAssessment'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].type_of_capacity_assessment === null ? '' : assessmentTypes[this.props.perOverviewForm.data.results[0].type_of_capacity_assessment]} /><br /><br />
                <Translate stringId='overviewFormBranchInvolved'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].branch_involved === null ? '' : this.props.perOverviewForm.data.results[0].branch_involved} /><br /><br />
                <Translate stringId='overviewFormFocalPoint'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].focal_point_name === null ? '' : this.props.perOverviewForm.data.results[0].focal_point_name} /><br /><br />
                <Translate stringId='overviewFormFocalPointEmail'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].focal_point_email === null ? '' : this.props.perOverviewForm.data.results[0].focal_point_email === null} /><br /><br />
                <Translate stringId='overviewFormPreviousPer'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].had_previous_assessment === null ? '' : this.props.perOverviewForm.data.results[0].had_previous_assessment} /><br /><br />
                <Translate stringId='overviewFormDateOfLastAssessment'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].date_of_last_capacity_assessment === null ? '' : this.props.perOverviewForm.data.results[0].date_of_last_capacity_assessment} /><br /><br />
                <Translate stringId='overviewFormTypeOfLastAssessment'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].type_of_last_capacity_assessment === null ? '' : assessmentTypes[this.props.perOverviewForm.data.results[0].type_of_last_capacity_assessment]} /><br /><br />
                <Translate stringId='overviewFormFocus'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].focus === null ? '' : this.props.perOverviewForm.data.results[0].focus} onChange={this.onFieldChange.bind(this, 'focus')} /><br /><br />

                <div className='per_form_ns'>
                  <Translate stringId='overviewFormFacilitatorInfo'/>
                </div>
                <Translate stringId='overviewFormNameLeadFacilitator'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].facilitated_by === null ? '' : this.props.perOverviewForm.data.results[0].facilitated_by} /><br /><br />
                <Translate stringId='overviewFormEmail'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].facilitator_email === null ? '' : this.props.perOverviewForm.data.results[0].facilitator_email} /><br /><br />
                <Translate stringId='overviewFormPhoneNumber'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].facilitator_phone === null ? '' : this.props.perOverviewForm.data.results[0].facilitator_phone} onChange={this.onFieldChange.bind(this, 'facilitator_phone')} /><br /><br />

                <Translate stringId='overviewFormSkype'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].skype_address === null ? '' : this.props.perOverviewForm.data.results[0].skype_address} /><br /><br />
                <Translate stringId='overviewFormDateOfMidReview'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].date_of_mid_term_review === null ? '' : this.props.perOverviewForm.data.results[0].date_of_mid_term_review} /><br /><br />

                <Translate stringId='overviewFormDateOfNext'/>
                <br />
                <input type='text' className='form__control form__control--medium' disabled='disabled' value={this.props.perOverviewForm.data.results[0].approximate_date_next_capacity_assmt === null ? '' : this.props.perOverviewForm.data.results[0].approximate_date_next_capacity_assmt} /><br /><br />
              </div>
            </div>
          </div>
        </React.Fragment>);
    } else {
      return (
        <React.Fragment>
          <Link to='/account#per-forms' className='button button--medium button--primary-filled' style={{float: 'right', marginBottom: '1rem'}}>
            <Translate stringId='overviewFormExit'/>
          </Link>
          <button className={c('button button--medium button--secondary-filled')} onClick={this.resetForm} style={{float: 'right', marginBottom: '1rem', marginRight: '4px'}}>Reset fields</button>
          <div className='fold'>
            <div className='inner'>

              <div className="fold__header">
                <h2 className="fold__title">
                  <Translate stringId='overviewFormPreparednessHeading'/>
                </h2>
              </div>
              <div style={{clear: 'both'}}></div>

              <div id="overview__form">
                <div className='per_form_ns'>
                  <Translate stringId='overviewFormGeneralInfo'/>
                </div>
                <Translate stringId='overviewFormStartDate'/>
                <br />
                <select className='form__control form__control--medium' style={{width: '100px', display: 'inline-block'}} name='date_of_current_assessment_year'>
                  <option value='2030'>2030</option>
                  <option value='2029'>2029</option>
                  <option value='2028'>2028</option>
                  <option value='2027'>2027</option>
                  <option value='2026'>2026</option>
                  <option value='2025'>2025</option>
                  <option value='2024'>2024</option>
                  <option value='2023'>2023</option>
                  <option value='2022'>2022</option>
                  <option value='2021'>2021</option>

                  <option value='2020' selected="selected">2020</option>
                  <option value='2019'>2019</option>
                  <option value='2018'>2018</option>

                  <option value='2017'>2017</option>
                  <option value='2016'>2016</option>
                  <option value='2015'>2015</option>

                  <option value='2014'>2014</option>
                  <option value='2013'>2013</option>
                  <option value='2012'>2012</option>
                  <option value='2011'>2011</option>
                  <option value='2010'>2010</option>

                </select>&nbsp;-&nbsp;
                <select className='form__control form__control--medium' style={{width: '100px', display: 'inline-block'}} name='date_of_current_assessment_month'>
                  <option value='01'>01</option>
                  <option value='02'>02</option>
                  <option value='03'>03</option>
                  <option value='04'>04</option>
                  <option value='05'>05</option>
                  <option value='06'>06</option>
                  <option value='07'>07</option>
                  <option value='08'>08</option>
                  <option value='09'>09</option>
                  <option value='10'>10</option>
                  <option value='11'>11</option>
                  <option value='12'>12</option>
                </select>&nbsp;-&nbsp;
                <select className='form__control form__control--medium' style={{width: '100px', display: 'inline-block'}} name='date_of_current_assessment_day'>
                  <option value='01'>01</option>
                  <option value='02'>02</option>
                  <option value='03'>03</option>
                  <option value='04'>04</option>
                  <option value='05'>05</option>
                  <option value='06'>06</option>
                  <option value='07'>07</option>
                  <option value='08'>08</option>
                  <option value='09'>09</option>
                  <option value='10'>10</option>
                  <option value='11'>11</option>
                  <option value='12'>12</option>
                  <option value='13'>13</option>
                  <option value='14'>14</option>
                  <option value='15'>15</option>
                  <option value='16'>16</option>
                  <option value='17'>17</option>
                  <option value='18'>18</option>
                  <option value='19'>19</option>
                  <option value='20'>20</option>
                  <option value='21'>21</option>
                  <option value='22'>22</option>
                  <option value='23'>23</option>
                  <option value='24'>24</option>
                  <option value='25'>25</option>
                  <option value='26'>26</option>
                  <option value='27'>27</option>
                  <option value='28'>28</option>
                  <option value='29'>29</option>
                  <option value='30'>30</option>
                  <option value='31'>31</option>
                </select><br /><br />

                <Translate stringId='overviewFormTypeCapacityAssessment'/>
                <br />
                <select className='form__control form__control--medium' style={{width: '200px', display: 'inline-block'}} name='capacity_assessment_type'>
                  <option value='0'>Self assessment</option>
                  <option value='1'>Simulation</option>
                  <option value='2'>Operation</option>
                  <option value='3'>Post operational</option>
                </select><br /><br />
                <Translate stringId='overviewFormBranchInvolved'/>
                <br />
                <input type='text' className='form__control form__control--medium' name='branch_involved' /><br /><br />

                <Translate stringId='overviewFormFocalPoint'/>
                <br />
                <input type='text' className='form__control form__control--medium' name='focal_point_name' /><br /><br />

                <Translate stringId='overviewFormFocalPointEmail'/>
                <br />
                <input type='text' className='form__control form__control--medium' name='focal_point_email' /><br /><br />

                <Translate stringId='overviewFormFocus'/>
                <br />
                <input type='text' className='form__control form__control--medium' name='focus' value={this.state.data.focus} onChange={this.onFieldChange.bind(this, 'focus')} /><br /><br />

                <Translate stringId='overviewFormPreviousPer'/>
                <br />
                <select className='form__control form__control--medium' name='prev_capacity_assessment' style={{width: '100px', display: 'inline-block'}}>
                  <option value='1'>Yes</option>
                  <option value='0'>No</option>
                </select><br /><br />

                <Translate stringId='overviewFormDateOfLastAssessment'/>
                <br />
                <select className='form__control form__control--medium' style={{width: '100px', display: 'inline-block'}} name='date_of_last_assessment_year'>
                  <option value='2030'>2030</option>
                  <option value='2029'>2029</option>
                  <option value='2028'>2028</option>
                  <option value='2027'>2027</option>
                  <option value='2026'>2026</option>
                  <option value='2025'>2025</option>
                  <option value='2024'>2024</option>
                  <option value='2023'>2023</option>
                  <option value='2022'>2022</option>
                  <option value='2021'>2021</option>

                  <option value='2020' selected="selected">2020</option>
                  <option value='2019'>2019</option>
                  <option value='2018'>2018</option>

                  <option value='2017'>2017</option>
                  <option value='2016'>2016</option>
                  <option value='2015'>2015</option>

                  <option value='2014'>2014</option>
                  <option value='2013'>2013</option>
                  <option value='2012'>2012</option>
                  <option value='2011'>2011</option>
                  <option value='2010'>2010</option>
                </select>&nbsp;-&nbsp;
                <select className='form__control form__control--medium' style={{width: '100px', display: 'inline-block'}} name='date_of_last_assessment_month'>
                  <option value='01'>01</option>
                  <option value='02'>02</option>
                  <option value='03'>03</option>
                  <option value='04'>04</option>
                  <option value='05'>05</option>
                  <option value='06'>06</option>
                  <option value='07'>07</option>
                  <option value='08'>08</option>
                  <option value='09'>09</option>
                  <option value='10'>10</option>
                  <option value='11'>11</option>
                  <option value='12'>12</option>
                </select>&nbsp;-&nbsp;
                <select className='form__control form__control--medium' style={{width: '100px', display: 'inline-block'}} name='date_of_last_assessment_day'>
                  <option value='01'>01</option>
                  <option value='02'>02</option>
                  <option value='03'>03</option>
                  <option value='04'>04</option>
                  <option value='05'>05</option>
                  <option value='06'>06</option>
                  <option value='07'>07</option>
                  <option value='08'>08</option>
                  <option value='09'>09</option>
                  <option value='10'>10</option>
                  <option value='11'>11</option>
                  <option value='12'>12</option>
                  <option value='13'>13</option>
                  <option value='14'>14</option>
                  <option value='15'>15</option>
                  <option value='16'>16</option>
                  <option value='17'>17</option>
                  <option value='18'>18</option>
                  <option value='19'>19</option>
                  <option value='20'>20</option>
                  <option value='21'>21</option>
                  <option value='22'>22</option>
                  <option value='23'>23</option>
                  <option value='24'>24</option>
                  <option value='25'>25</option>
                  <option value='26'>26</option>
                  <option value='27'>27</option>
                  <option value='28'>28</option>
                  <option value='29'>29</option>
                  <option value='30'>30</option>
                  <option value='31'>31</option>
                </select><br /><br />

                <Translate stringId='overviewFormTypeOfLastAssessment'/>
                <br />
                <select className='form__control form__control--medium' style={{width: '200px', display: 'inline-block'}} name='type_of_last_assessment'>
                  <option value='0'>Self assessment</option>
                  <option value='1'>Simulation</option>
                  <option value='2'>Operation</option>
                  <option value='3'>Post operational</option>
                </select><br /><br />

                <div className='per_form_ns'>
                  <Translate stringId='overviewFormFacilitatorInfo'/>
                </div>
                <Translate stringId='overviewFormNameLeadFacilitator'/>
                <br />
                <input type='text' className='form__control form__control--medium' name='facilitated_by' /><br /><br />
                <Translate stringId='overviewFormEmail'/>
                <br />
                <input type='text' className='form__control form__control--medium' name='facilitator_email' /><br /><br />
                <Translate stringId='overviewFormPhoneNumber'/>
                <br />
                <input type='text' className='form__control form__control--medium' name='facilitator_phone' value={this.state.data.facilitator_phone} onChange={this.onFieldChange.bind(this, 'facilitator_phone')} /><br /><br />
                <Translate stringId='overviewFormSkype'/>
                <br />
                <input type='text' className='form__control form__control--medium' name='facilitator_skype' /><br /><br />

                <Translate stringId='overviewFormDateOfMidReview'/>
                <br />
                <select className='form__control form__control--medium' style={{width: '100px', display: 'inline-block'}} name='date_of_mid_review_year'>
                  <option value='2030'>2030</option>
                  <option value='2029'>2029</option>
                  <option value='2028'>2028</option>
                  <option value='2027'>2027</option>
                  <option value='2026'>2026</option>
                  <option value='2025'>2025</option>
                  <option value='2024'>2024</option>
                  <option value='2023'>2023</option>
                  <option value='2022'>2022</option>
                  <option value='2021'>2021</option>

                  <option value='2020' selected="selected">2020</option>
                  <option value='2019'>2019</option>
                  <option value='2018'>2018</option>

                  <option value='2017'>2017</option>
                  <option value='2016'>2016</option>
                  <option value='2015'>2015</option>

                  <option value='2014'>2014</option>
                  <option value='2013'>2013</option>
                  <option value='2012'>2012</option>
                  <option value='2011'>2011</option>
                  <option value='2010'>2010</option>
               </select>&nbsp;-&nbsp;
                <select className='form__control form__control--medium' style={{width: '100px', display: 'inline-block'}} name='date_of_mid_review_month'>
                  <option value='01'>01</option>
                  <option value='02'>02</option>
                  <option value='03'>03</option>
                  <option value='04'>04</option>
                  <option value='05'>05</option>
                  <option value='06'>06</option>
                  <option value='07'>07</option>
                  <option value='08'>08</option>
                  <option value='09'>09</option>
                  <option value='10'>10</option>
                  <option value='11'>11</option>
                  <option value='12'>12</option>
                </select>&nbsp;-&nbsp;
                <select className='form__control form__control--medium' style={{width: '100px', display: 'inline-block'}} name='date_of_mid_review_day'>
                  <option value='01'>01</option>
                  <option value='02'>02</option>
                  <option value='03'>03</option>
                  <option value='04'>04</option>
                  <option value='05'>05</option>
                  <option value='06'>06</option>
                  <option value='07'>07</option>
                  <option value='08'>08</option>
                  <option value='09'>09</option>
                  <option value='10'>10</option>
                  <option value='11'>11</option>
                  <option value='12'>12</option>
                  <option value='13'>13</option>
                  <option value='14'>14</option>
                  <option value='15'>15</option>
                  <option value='16'>16</option>
                  <option value='17'>17</option>
                  <option value='18'>18</option>
                  <option value='19'>19</option>
                  <option value='20'>20</option>
                  <option value='21'>21</option>
                  <option value='22'>22</option>
                  <option value='23'>23</option>
                  <option value='24'>24</option>
                  <option value='25'>25</option>
                  <option value='26'>26</option>
                  <option value='27'>27</option>
                  <option value='28'>28</option>
                  <option value='29'>29</option>
                  <option value='30'>30</option>
                  <option value='31'>31</option>
                </select><br /><br />

                <Translate stringId='overviewFormDateOfNext'/>
                <br />
                <select className='form__control form__control--medium' style={{width: '100px', display: 'inline-block'}} name='date_of_next_assessment_year'>
                  <option value='2030'>2030</option>
                  <option value='2029'>2029</option>
                  <option value='2028'>2028</option>
                  <option value='2027'>2027</option>
                  <option value='2026'>2026</option>
                  <option value='2025'>2025</option>
                  <option value='2024'>2024</option>
                  <option value='2023'>2023</option>
                  <option value='2022'>2022</option>
                  <option value='2021'>2021</option>

                  <option value='2020' selected="selected">2020</option>
                  <option value='2019'>2019</option>
                  <option value='2018'>2018</option>

                  <option value='2017'>2017</option>
                  <option value='2016'>2016</option>
                  <option value='2015'>2015</option>

                  <option value='2014'>2014</option>
                  <option value='2013'>2013</option>
                  <option value='2012'>2012</option>
                  <option value='2011'>2011</option>
                  <option value='2010'>2010</option>

                </select>&nbsp;-&nbsp;
                <select className='form__control form__control--medium' style={{width: '100px', display: 'inline-block'}} name='date_of_next_assessment_month'>
                  <option value='01'>01</option>
                  <option value='02'>02</option>
                  <option value='03'>03</option>
                  <option value='04'>04</option>
                  <option value='05'>05</option>
                  <option value='06'>06</option>
                  <option value='07'>07</option>
                  <option value='08'>08</option>
                  <option value='09'>09</option>
                  <option value='10'>10</option>
                  <option value='11'>11</option>
                  <option value='12'>12</option>
                </select>&nbsp;-&nbsp;
                <select className='form__control form__control--medium' style={{width: '100px', display: 'inline-block'}} name='date_of_next_assessment_day'>
                  <option value='01'>01</option>
                  <option value='02'>02</option>
                  <option value='03'>03</option>
                  <option value='04'>04</option>
                  <option value='05'>05</option>
                  <option value='06'>06</option>
                  <option value='07'>07</option>
                  <option value='08'>08</option>
                  <option value='09'>09</option>
                  <option value='10'>10</option>
                  <option value='11'>11</option>
                  <option value='12'>12</option>
                  <option value='13'>13</option>
                  <option value='14'>14</option>
                  <option value='15'>15</option>
                  <option value='16'>16</option>
                  <option value='17'>17</option>
                  <option value='18'>18</option>
                  <option value='19'>19</option>
                  <option value='20'>20</option>
                  <option value='21'>21</option>
                  <option value='22'>22</option>
                  <option value='23'>23</option>
                  <option value='24'>24</option>
                  <option value='25'>25</option>
                  <option value='26'>26</option>
                  <option value='27'>27</option>
                  <option value='28'>28</option>
                  <option value='29'>29</option>
                  <option value='30'>30</option>
                  <option value='31'>31</option>
                </select><br /><br />

                <button className={c('button button--medium button--primary-filled', { disabled: !this.allowSubmit() })} onClick={this.submitForm}>Submit form</button>&nbsp;
                <button className='button button--medium button--secondary-filled' onClick={this.saveDraft}>
                  <Translate stringId='overviewFormSaveAsDraft'/>
                </button>
                <p><br />
                  <Translate stringId='overviewFormDraftInfo' />
                </p>
              </div>
            </div>
          </div>
        </React.Fragment>);
    }
  }
}

// /////////////////////////////////////////////////////////////////// //
// Connect functions

if (environment !== 'production') {
  OverviewForm.propTypes = {
    _sendPerForm: T.func,
    _getPerOverviewForm: T.func,
    _sendPerOverview: T.func,
    _getPerDraftDocument: T.func,
    sendPerFormResponse: T.object,
    view: T.bool,
    formId: T.string,
    perOverviewForm: T.object,
    sendPerWorkPlan: T.func,
    nationalSociety: T.string,
    user: T.object,
    getPerDraftDocument: T.object,
    _sendPerDraft: T.func
  };
}

const selector = (state) => ({
  sendPerForm: state.perForm.sendPerForm,
  perDocument: state.perForm.getPerDocument,
  sendPerDraft: state.perForm.sendPerDraft,
  getPerDraftDocument: state.perForm.getPerDraftDocument,
  perOverviewForm: state.perForm.getPerOverviewForm,
  sendPerWorkPlan: state.perForm.sendPerWorkPlan,
  user: state.user
});

const dispatcher = (dispatch) => ({
  _sendPerForm: (payload) => dispatch(sendPerForm(payload)),
  _getPerDocument: (...args) => dispatch(getPerDocument(...args)),
  _getPerDraftDocument: (...args) => dispatch(getPerDraftDocument(...args)),
  _sendPerDraft: (payload) => dispatch(sendPerDraft(payload)),
  _editPerDocument: (payload) => dispatch(editPerDocument(payload)),
  _getPerOverviewForm: (...args) => dispatch(getPerOverviewForm(...args)),
  _sendPerOverview: (...args) => dispatch(sendPerOverview(...args))
});

export default connect(selector, dispatcher)(OverviewForm);
