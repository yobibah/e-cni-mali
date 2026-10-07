const PayerDemande = async ({ demande_id }) => {
    const response = await fetch(`/api/demandes/${demande_id}/payer`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error('Erreur lors du paiement');
    }
    
    return response.json();
};

export default PayerDemande;