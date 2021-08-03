import SettingsInput from './../SettingsInput';

import './index.scss';

const SettingsForm = ({ settings, onSubmit:onSubmitProp })=>{
  const onSubmit = event=>{
    event.preventDefault();

    const submittedSettings = [...event.target.querySelectorAll(".setting-input [name]")].reduce((data, {name, value})=>({...data, [name]: value}), {});

    onSubmitProp(submittedSettings);
  };

  return (
    <form onSubmit={onSubmit}>
      {Object.entries(settings).map(([name, props])=>(<SettingsInput key={name} setting={{name, ...props}} />))}
      <div className="d-flex justify-content-center mt-4">
        <button className="btn btn-primary" type="submit">Save</button>
      </div>
    </form>
  );
};

export default SettingsForm;
