import React from "react";
import Header from "./Header";
import HRFormBuilder from "./HRFormBuilder";
import HRJobInsights from "./HrJobInsights";

const HRPortal = () => {
    return (
      <>
        <Header />
        <div className="container mt-4">
          <div className="row">
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <HRJobInsights />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <HRFormBuilder />
                </div>
              </div>
            </div>
          </div>
        </div> 
      </>
    );
  };
  
export default HRPortal;
