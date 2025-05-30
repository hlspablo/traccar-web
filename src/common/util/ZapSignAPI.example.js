// Example usage of ZapSignAPI utility
import ZapSignAPI from './ZapSignAPI';

// Example 1: Create document via template
export const createContractExample = async () => {
  try {
    const result = await ZapSignAPI.createDocViaTemplate({
      sendEmail: false,
      sendWhatsapp: false,
      signerName: 'Pablo Henrique',
      signerEmail: 'pabllobeg@gmail.com',
      signerPhoneCountry: '55',
      signerPhoneNumber: '86994547968',
      brandLogo: 'https://coragemrastro.top/assets/coragem-logo-XnN66kJy.png',
      folderPath: 'MesAtual',
      data: [
        {
          de: '{{NOME_PLANO}}',
          para: 'CARRO ESSENCIAL',
        },
        {
          de: '{{NOME_CLIENTE}}',
          para: 'Pablo Henrique',
        },
        {
          de: '{{CPF_CLIENTE}}',
          para: '611.096.523-56',
        },
        {
          de: '{{END_CLIENTE}}',
          para: 'Q336, C4, Itararé, 2525',
        },
        {
          de: '{{CIDADE_EST_CLIENTE}}',
          para: 'Teresina-PI',
        },
        {
          de: '{{TELEFONE_CLIENTE}}',
          para: '(86) 994547968',
        },
        {
          de: '{{EMAIL_CLIENTE}}',
          para: 'pabllobeg@gmail.com',
        },
        {
          de: '{{PLACA}}',
          para: 'PIG2569',
        },
        {
          de: '{{COR}}',
          para: 'Branco',
        },
        {
          de: '{{nome_plano_dois}}',
          para: 'Coragem Essencial',
        },
        {
          de: '{{VALOR_PLANO}}',
          para: '26,44',
        },
        {
          de: '{{valor_extenso}}',
          para: 'Vinte e Seis e Quarenta e Quatro Centavos',
        },
      ],
    });

    console.log('Document created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating document:', ZapSignAPI.handleError(error));
    throw error;
  }
};

// Example 2: Add signer to existing document
export const addSignerExample = async (documentId) => {
  try {
    const result = await ZapSignAPI.addSigner(documentId, {
      name: 'Marco Aurélio da Silva Leite',
      email: 'aurelio@gmail.com',
      phoneCountry: '55',
      phoneNumber: '86994547968',
      sendAutomaticEmail: true,
      sendAutomaticWhatsapp: false,
    });

    console.log('Signer added successfully:', result);
    return result;
  } catch (error) {
    console.error('Error adding signer:', ZapSignAPI.handleError(error));
    throw error;
  }
};

// Example 3: Complete workflow - Create document and add additional signer
export const completeWorkflowExample = async () => {
  try {
    // Step 1: Create document
    const document = await createContractExample();

    // Step 2: Add additional signer if document creation was successful
    if (document && document.id) {
      const signerResult = await addSignerExample(document.id);

      return {
        document,
        additionalSigner: signerResult,
      };
    }

    return { document };
  } catch (error) {
    console.error('Error in complete workflow:', ZapSignAPI.handleError(error));
    throw error;
  }
};
