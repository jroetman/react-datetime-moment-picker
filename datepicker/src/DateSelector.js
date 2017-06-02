import React, { Component } from 'react'
import moment from 'moment'

class DateSelector extends React.Component {
    constructor(props){
      super(props)
      this.incrementMoment = this.incrementMoment.bind(this)
      this.handleBlur       = this.handleBlur.bind(this)
      this.handleKeyUp     = this.handleKeyUp.bind(this)
      this.onDateUpdate    = this.onDateUpdate.bind(this)
      this.updateStateMoment     = this.updateStateMoment.bind(this)
      this.handleShowCal   = this.handleShowCal.bind(this)

      this.state = {m : moment().second(0), year : 0, month: 0, date:0};
      this.updateInterval = null;

      this.sections = [{s : "year",     f:"YYYY", f2 : "YYYY"},
                       {s : "month",    f:"MMM" , f2 : "MM"},
                       {s : "day",     f:"DD"  , f2 : "DD"},
                       {s:  "hour",     f: "HH" , f2 : "HH"},
                       {s:  "minute",   f: "mm" , f2 : "mm"},
                       ]
      this.dayNames  = ["Su", "Mo", "Tu", "We", "Th", "Fr","Sa"].map(dn =>{
          return <th key={"dayName" + dn} className="dayName"> {dn} </th>
      });
    }

    /**
     * A corresponding onDateUpdate should be passed in through props when using this component
     */
    onDateUpdate(nm){
       if(this.props.onDateUpdate) this.props.onDateUpdate(nm);
    }

    handleShowCal(bool){
        this.setState({showCal : bool})
    }

    updateMoment(field){
         var nm = moment(this.state.m);
         var val = this.state[field];
         var updateField = field;

         if(field == "day") updateField = "date"

         if(val == "" ) {
             val = nm.get(updateField);

         } else {
             if(field == "month") val = val - 1;

        }

         nm.set(updateField, val)
         this.setState(this.updateStateMoment.bind(null,nm));
         return nm;
    }

    handleKeyUp(field, e){
       var key = e.which;
       if(key == 27 ) {
          this[field + "Input"].blur();

       } else if(key == 13) {
           var nm = this.updateMoment(field);
           this.onDateUpdate(nm);

           this[field + "Input"].blur();
       }
    }

    handleBlur(field, bool){
        if(bool == true) {
           this.updateMoment(field);

        } else {
            //clear input
            this.setState({[field]: ""});

        }
    }

    updateStateMoment(nm){
        return {m : nm, year: nm.year(), month : nm.month(), day : nm.date(), hour: nm.hour(), minute:nm.minute()};
    }

    incrementMoment(field, val, direction) {
         var nm = moment(this.state.m)
         var updateField = field;

         if(field === "day") {
             updateField = "date"
         }

         if(field === "moment") {
             nm =val;

         } else {
             if(direction == "add") val = nm.get(updateField) + val;
             if(direction == "subtract")val = nm.get(updateField) - val;
             nm.set(updateField, val);

         }

         this.setState(this.updateStateMoment.bind(null,nm));
         this.onDateUpdate(nm);
    }


    componentWillReceiveProps(nextProps, nextState){
        if(!nextProps.moment.isSame(this.state.m) || nextProps.moment.utcOffset() != this.state.m.utcOffset()) {
            var nm = moment(nextProps.moment);
            this.setState(this.updateStateMoment.bind(null,nm));

        }

    }

    componentWillMount(){
        var nm = moment(this.props.moment);
        this.setState(this.updateStateMoment.bind(null,nm));

    }

    render(){
       var m = this.state.m
       var showCal = this.state.showCal;
       var dom = <p className="formatDate" onClick={this.handleShowCal.bind(null, true)}> {m.format("YYYY-MM-DD HH mm")} <i className="fa fa-pencil-square-o fa-sm" /> </p>

       if(showCal) {
           var selected = "";
           var firstDay = moment(m).startOf("month");
           var days    = [];
           var hours   = [[],[],[],[],[],[]];
           var minutes = [[],[],[],[],[],[],[],[],[],[]];
           var monthDays=[[],[],[],[],[],[]];
           var i = 0;
           var mIdx = 0;

           var nm;
           for(i = 1; i < firstDay.weekday() + 1; i++) {
               nm = moment(firstDay).subtract(i, "day")
               monthDays[mIdx].push(<td key={"prevMonthDay" + i} className="monthDay outside" onClick={this.incrementMoment.bind(null, "moment", moment(nm))}> {nm.date()}</td>);

           }

           for(i = firstDay.date(); i <= m.daysInMonth(); i++){
               selected = i == m.date() ? "selected" : "";
               monthDays[mIdx].push(<td key={"day" + i} className={"monthDay inside " + selected}  onClick={this.incrementMoment.bind(null, "day", i, "")}> {i} </td>);
               if(moment(m).set("date", i).weekday() == 6) {
                   mIdx += 1;
               }

           }

           var rm = (7 - monthDays[4].length) + (7 - monthDays[5].length);
           for(i = 1; i <= rm; i++) {
               nm = moment(m).endOf("month").add(i, "day")
               monthDays[mIdx].push(<td key={"nextMonthDay" + i} className="monthDay outside" onClick={this.incrementMoment.bind(null, "moment", moment(nm))}> {nm.date()}</td>);

               if(nm.weekday() == 6) {
                   mIdx += 1;
               }
          }

           var idx = 0;
           var h;
           for(i = 1; i <= 24; i++) {
               h = i - 1;
               selected = h== m.hour() ? "selected" : "";
               hours[idx].push(<td key={"hour" + h} className={"hour " + selected} onClick={this.incrementMoment.bind(null,"hour", h)}> {("00" + h).slice(-2)}</td>);
               if(i % 4 == 0) idx++;
           }

           idx = 0;
           for(i = 1; i <= 60; i++) {
               h = i - 1;
               selected = h == m.minute() ? "selected" : "";
               minutes[idx].push(<td key={"minute" + h} className={"minute " + selected} onClick={this.incrementMoment.bind(null,"minute", h)}> {("00" + h).slice(-2)}</td>);
               if(i % 10 == 0) idx++;
           }


          dom = <div key={this.props.name}  className="date-selector">
                  <div className="section day">
                    <table>
                    <thead>
                        <tr className="currentMonth">
                            <td className="" colSpan="5">{m.format("YYYY MMM")} </td>
                            <td onClick={this.incrementMoment.bind(null, "month", 1, "subtract")} className="" colSpan="1"><i className="fa fa-angle-up fa-lg" aria-hidden="true"></i></td>
                            <td onClick={this.incrementMoment.bind(null, "month", 1,"add")} className="" colSpan="1"><i className="fa fa-angle-down fa-lg" aria-hidden="true"></i></td>
                            <td onClick={this.handleShowCal.bind(null, false)} ><i className="fa fa-times fa-lg text-danger" aria-hidden="true"></i></td>
                         </tr>
                        <tr>{this.dayNames}</tr>
                    </thead>
                     <tbody>
                          {monthDays.map((month,idx) =>{
                             return <tr key={"monthDay" + idx}> {month} </tr>
                          })}
                     </tbody>
                     </table>
                  </div >
                  <div className="section hours">
                    <table>
                    <thead><tr><th colSpan="4" >Hours</th></tr></thead>
                     <tbody>
                          <td colSpan="4"><hr /></td>
                          {hours.map((hour,idx) =>{
                             return <tr key={"hours" + idx}> {hour} </tr>
                          })}
                     </tbody>
                     </table>
                  </div >
                  <div className="section min">
                    <table>
                    <thead><tr><th colSpan="10">Minutes</th></tr></thead>
                     <tbody>
                          <td colSpan="10"><hr /></td>
                          {minutes.map((minute,idx) =>{
                             return <tr key={"minutes" + idx}> {minute} </tr>
                          })}
                     </tbody>
                     </table>
                  </div>
              </div>
       }

       return dom;

   }
}
export default DateSelector
