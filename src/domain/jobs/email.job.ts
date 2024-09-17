import cron from 'node-cron';
import { ViruelaModel } from '../../data/models/viruela.models';
import { EmailService } from '../services/email.service';
import { ViruelaDataSource } from '../datasources/viruela.datasource';
import { generateIncidentEmailTemplate } from '../templates/email.templates';

export const emailJob = (): void => {
    const emailService = new EmailService();
    const viruelaDataSource = new ViruelaDataSource();

    cron.schedule('*/10 * * * * *', async (): Promise<void> => {
        console.log("Cada 10 segundos");
        try {
            const viruela = await ViruelaModel.find({ isSent: false });
            if (!viruela.length) {
                console.log("No hay Incidentes pendientes de enviar");
                return;
            }

            console.log(`Procesando ${viruela.length} incidentes.`);

            await Promise.all(
                viruela.map(async (viruelaM) => {
                    const htmlBody = generateIncidentEmailTemplate(
                        viruelaM.lat,
                        viruelaM.lng,
                        viruelaM.genre,
                        viruelaM.age,
                        viruelaM.creationDate
                    );

                    await emailService.sendEmail({
                        to: "bryanmontoya838@@gmail.com",
                        subject: `Caso Viruela del Mono: ${viruelaM.creationDate}`,
                        htmlBody: htmlBody
                    });

                    console.log(`Email enviado para el incidente con ID: ${viruelaM._id}`);

                    await viruelaDataSource.updateIncident(viruelaM._id.toString(), { ...viruelaM, isSent: true });
                    console.log(`Incidente actualizado para el ID: ${viruelaM._id}`);
                })
            );
        } catch (error) {
            console.error("Error durante el trabajo de envio de correos", error);
        }
    });
}
