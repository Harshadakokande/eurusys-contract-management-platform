/**
 * ContractView Page
 * View contract details, fill fields, and manage lifecycle transitions
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContractStore } from '../../../stores';
import { useToast } from '../../../components/ui/Toast/Toast';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Input } from '../../../components/ui/Input/Input';
import { Button } from '../../../components/ui/Button/Button';
import { Badge } from '../../../components/ui/Badge/Badge';
import { SignaturePad } from '../../../components/features/SignaturePad/SignaturePad';
import { STATUS_LABELS, type ContractStatus, type ContractField } from '../../../types';
import { getValidTransitions } from '../../../utils/stateMachine';

import { formatDate } from '../../../utils/helpers';
import styles from './ContractView.module.css';

const LIFECYCLE_STEPS: ContractStatus[] = [
    'CREATED',
    'APPROVED',
    'SENT',
    'SIGNED',
    'LOCKED',
];

export function ContractView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const {
        getContract,
        updateContractFields,
        transitionStatus,
        deleteContract,
    } = useContractStore();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTransitionModal, setShowTransitionModal] =
        useState<ContractStatus | null>(null);
    const [showSendModal, setShowSendModal] = useState(false);
    const [showSignModal, setShowSignModal] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [modalSignature, setModalSignature] = useState<string | null>(null);

    const contract = id ? getContract(id) : undefined;

    if (!contract) {
        return (
            <div className={styles.page}>
                <h1 className={styles.title}>Contract Not Found</h1>
                <p className={styles.emptyStateText}>
                    The contract you're looking for doesn't exist.
                </p>
                <Link to="/">
                    <Button style={{ marginTop: 'var(--space-4)' }}>
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }
    const validTransitions = getValidTransitions(contract.status);

    /* -------------------- Helpers -------------------- */

    const getSignatureStatus = (): 'drafting' | 'pending' | 'signed' => {
        if (contract.status === 'SENT') return 'pending';
        if (contract.status === 'SIGNED' || contract.status === 'LOCKED') return 'signed';
        return 'drafting';
    };

    const handleFieldChange = (
        fieldId: string,
        value: string | boolean | null
    ) => {
        const updatedFields = contract.fields.map((f) =>
            f.id === fieldId ? { ...f, value } : f
        );
        updateContractFields(contract.id, updatedFields);
    };

    const handleTransition = (newStatus: ContractStatus) => {
        transitionStatus(contract.id, newStatus);
        setShowTransitionModal(null);

        const toastMessages: Record<ContractStatus, string> = {
            CREATED: 'Contract reverted to draft.',
            APPROVED: 'Contract approved.',
            SENT: 'Contract sent to client.',
            SIGNED: 'Contract signed.',
            LOCKED: 'Contract locked and archived.',
            REVOKED: 'Contract revoked.',
        };

        showToast(
            toastMessages[newStatus] ||
                `Status changed to ${STATUS_LABELS[newStatus]}`
        );
    };

    const handleSendContract = () => {
        if (!recipientEmail.trim()) return;
        transitionStatus(contract.id, 'SENT');
        setShowSendModal(false);
        showToast(`Email sent to ${recipientEmail} (simulated).`);
        setRecipientEmail('');
       
    };

    const handleSignContract = () => {
        const signatureField = contract.fields.find(
            (f) => f.type === 'SIGNATURE'
        );

        if (signatureField && modalSignature) {
            updateContractFields(
                contract.id,
                contract.fields.map((f) =>
                    f.id === signatureField.id
                        ? { ...f, value: modalSignature }
                        : f
                )
            );
        }

        transitionStatus(contract.id, 'SIGNED');
        setShowSignModal(false);
        setModalSignature(null);
        showToast('Client signature recorded.');
    };

    const handleDelete = () => {
        deleteContract(contract.id);
        navigate('/');
    };

    /*  FIXED: REVOKED handling */
    const getStepStatus = (
        step: ContractStatus
    ): 'completed' | 'current' | 'pending' | 'revoked' => {
        if (contract.status === 'REVOKED') return 'revoked';

        const stepIndex = LIFECYCLE_STEPS.indexOf(step);
        const currentIndex = LIFECYCLE_STEPS.indexOf(contract.status);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    /* -------------------- Rendering -------------------- */

    const renderField = (field: ContractField) => {
        const isManagerField =
            !field.editableBy ||
            field.editableBy === 'manager' ||
            field.editableBy === 'both';

        const isClientField =
            field.editableBy === 'client' || field.editableBy === 'both';

        let isDisabled = true;

        if (contract.status === 'CREATED') {
            isDisabled = !isManagerField;
        } else if (contract.status === 'SENT') {
            isDisabled = !isClientField;
        }

        switch (field.type) {
            case 'TEXT':
                return isDisabled ? (
                    <div className={styles.inputWrapper}>
                        <label className={styles.inputLabel}>{field.label}</label>
                        <p className={styles.inputValue}>
                            {(field.value as string) || '—'}
                        </p>
                    </div>
                ) : (
                    <Input
                        key={field.id}
                        label={field.label}
                        value={(field.value as string) ?? ''}
                        onChange={(e) =>
                            handleFieldChange(field.id, e.target.value)
                        }
                        disabled={isDisabled}
                    />
                );

            case 'DATE':
                return isDisabled ? (
                    <div className={styles.inputWrapper}>
                        <label className={styles.inputLabel}>{field.label}</label>
                        <p className={styles.inputValue}>
                            {formatDate(field.value as string) || '—'}
                        </p>
                    </div>
                ) : (
                    <Input
                        key={field.id}
                        type="date"
                        label={field.label}
                        value={(field.value as string) ?? ''}
                        onChange={(e) =>
                            handleFieldChange(field.id, e.target.value)
                        }
                        disabled={isDisabled}
                    />
                );

            case 'SIGNATURE':
                return (
                    <SignaturePad
                        key={field.id}
                        label={field.label}
                        value={field.value as string | null}
                        onChange={(value) =>
                            handleFieldChange(field.id, value)
                        }
                        disabled={isDisabled}
                        signatureStatus={getSignatureStatus()}
                        signerName="Client"
                    />
                );

            case 'CHECKBOX':
                return (
                    <div key={field.id} className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            checked={(field.value as boolean) ?? false}
                            onChange={(e) =>
                                handleFieldChange(field.id, e.target.checked)
                            }
                            disabled={isDisabled}
                        />
                        <label>{field.label}</label>
                    </div>
                );

            default:
                return null;
        }
    };

    /* -------------------- JSX -------------------- */

    return (
        <div className={styles.page}>
            <Link to="/" className={styles.backLink}>
                ← Back to Dashboard
            </Link>

            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{contract.name}</h1>
                    <p className={styles.description}>
                        Manage your contract lifecycle
                    </p>
                </div>
                <Badge variant={contract.status}>
                    {STATUS_LABELS[contract.status]}
                </Badge>
            </div>

            {/* Timeline */}
            <div className={styles.timeline}>
                {LIFECYCLE_STEPS.map((step) => (
                    <div
                        key={step}
                        className={`${styles.timelineStep} ${styles[getStepStatus(step)]}`}
                    >
                        <div className={styles.timelineIcon} />
                        <span className={styles.timelineLabel}>
                            {STATUS_LABELS[step]}
                        </span>
                    </div>
                ))}
            </div>

            {/* Fields */}
            <div className={styles.fieldsSection}>
                <h2 className={styles.sectionTitle}>Contract Fields</h2>
                {contract.fields
                    .sort((a, b) => a.position - b.position)
                    .map(renderField)}
            </div>

            {/* Actions */}
            <div className={styles.actionsSection}>
                {validTransitions.includes('APPROVED') && (
                    <Button onClick={() => setShowTransitionModal('APPROVED')}>
                        Approve
                    </Button>
                )}
                {validTransitions.includes('SENT') && (
                    <Button onClick={() => setShowSendModal(true)}>
                        Send
                    </Button>
                )}
                {validTransitions.includes('LOCKED') && (
                    <Button onClick={() => setShowTransitionModal('LOCKED')}>
                        Lock
                    </Button>
                )}
                {validTransitions.includes('REVOKED') && (
                    <Button
                        variant="danger"
                        onClick={() => setShowTransitionModal('REVOKED')}
                    >
                        Revoke
                    </Button>
                )}
                <Button
                    variant="ghost"
                    onClick={() => setShowDeleteModal(true)}
                >
                    Delete
                </Button>
            </div>

            {/* Modals */}
            <Modal
                isOpen={!!showTransitionModal}
                onClose={() => setShowTransitionModal(null)}
                title="Confirm Action"
            >
                <Button
                    onClick={() =>
                        showTransitionModal &&
                        handleTransition(showTransitionModal)
                    }
                >
                    Confirm
                </Button>
            </Modal>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Contract"
            >
                <Button variant="danger" onClick={handleDelete}>
                    Delete
                </Button>
            </Modal>

            <Modal
                isOpen={showSendModal}
                onClose={() => setShowSendModal(false)}
                title="Send Contract"
            >
                <Input
                    label="Recipient Email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                />
                <Button onClick={handleSendContract}>Send</Button>
            </Modal>

            <Modal
                isOpen={showSignModal}
                onClose={() => setShowSignModal(false)}
                title="Sign Contract"
            >
                <SignaturePad
                    label="Client Signature"
                    value={modalSignature}
                    onChange={setModalSignature}
                />
                <Button
                    onClick={handleSignContract}
                    disabled={!modalSignature}
                >
                    Submit
                </Button>
            </Modal>
        </div>
    );
}
