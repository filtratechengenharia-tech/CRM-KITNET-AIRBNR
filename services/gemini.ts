
import { GoogleGenAI } from "@google/genai";
import { Guest, Property, Booking } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  async generateGuestEmail(guest: Guest, type: 'welcome' | 'thank_you' | 'offer', context?: string, lastBooking?: Booking): Promise<string> {
    try {
      const stayNotesContext = lastBooking?.stayNotes 
        ? `IMPORTANTE - Considere estas observações da estadia passada: "${lastBooking.stayNotes}".` 
        : '';

      const prompt = `
        Aja como um host profissional e amigável de Airbnb.
        Escreva uma mensagem curta para WhatsApp/Email.
        
        Hóspede: ${guest.name} (${guest.tags.join(', ')})
        ${stayNotesContext}
        Tipo: ${type}
        Contexto Extra: ${context || 'Nenhum'}
        
        Tom: Caloroso, direto, brasileiro. Sem "Assunto:".
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Erro na geração.";
    } catch (error) {
      console.error(error);
      return "Erro na IA.";
    }
  },

  async analyzeGuestStrategy(guest: Guest, bookings: Booking[], properties: Property[]): Promise<string> {
    try {
      const prompt = `Analise este hóspede: ${guest.name}, ${guest.totalStays} estadias. Tags: ${guest.tags.join(', ')}. Sugira 3 ações de fidelização rápidas.`;
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      return response.text || "Sem dados.";
    } catch (error) {
        return "Erro na análise.";
    }
  },

  async generateInstagramPost(property: Property, occasion: string): Promise<string> {
      try {
          const prompt = `
            Crie um post para Instagram (Legenda + Sugestão Visual) para promover esta propriedade de aluguel por temporada.
            
            Propriedade: ${property.name}
            Experiência/Vibe: ${property.experienceDescription || 'Aconchegante e bem localizada'}
            Localização: ${property.address}
            Ocasião/Foco: ${occasion} (ex: Feriado, Fim de semana, Evento local)
            
            Formato de saída:
            📸 Ideia de Foto: [Descreva a foto ideal]
            📝 Legenda: [Texto engajador com emojis e hashtags]
          `;
          
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
    
          return response.text || "Não foi possível gerar o post.";
      } catch (error) {
          console.error(error);
          return "Erro ao conectar com a IA.";
      }
  },

  async generateCampaignMessage(guestName: string, occasion: string, offerDetails: string, strategyContext?: string, propertyFocus?: string): Promise<string> {
      try {
          const isGeneric = guestName === 'GENERIC_TEMPLATE';
          const namePrompt = isGeneric ? "Use um placeholder como '[Nome do Cliente]'" : `Nome do Hóspede: ${guestName}`;
          const tonePrompt = isGeneric ? "Crie um modelo de mensagem genérico que sirva para enviar para vários clientes em uma lista de transmissão." : "A mensagem deve parecer pessoal, não robótica.";

          const prompt = `
            Crie uma mensagem curta, persuasiva e estratégica de WhatsApp para reengajar hóspedes.
            
            ${namePrompt}
            Ocasião/Data: ${occasion}
            Foco do Imóvel: ${propertyFocus || 'Geral'} (Adapte o texto para este tipo de experiência: Praia ou Campo)
            
            ESTRATÉGIA ESPECÍFICA A SEGUIR:
            "${strategyContext || 'Foque em convidar para voltar.'}"
            
            Oferta/Detalhe: ${offerDetails}
            
            ${tonePrompt}
          `;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
    
          return response.text || "Erro ao gerar mensagem.";
      } catch (error) {
          console.error(error);
          return "Erro na IA.";
      }
  }
};
