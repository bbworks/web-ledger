import {useState, useEffect} from 'react';

import Modal from 'react-bootstrap/Modal';
import SettingsForm from './../SettingsForm';

import './index.scss';

const SignInSettingsModal = ({ settings, isOpen, onClose, onSubmit:onSubmitProp })=>{
  const onSubmit = submittedSettings=>{
    onSubmitProp(submittedSettings);

    onClose();
  };

  return (
    <Modal id="signin-settings-modal" show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title className="modal-title">Sign In Settings</Modal.Title>
        <button className="btn-close" type="button" data-bs-dismiss="modal" onClick={onClose}></button>
      </Modal.Header>
      <Modal.Body>
        <div className="alert alert-warning d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Please assure the following settings are valid.
        </div>
        <SettingsForm settings={settings} onSubmit={onSubmit} />
      </Modal.Body>
    </Modal>
  );
};

export default SignInSettingsModal;
