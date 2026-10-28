import type { Metadata } from "next";
import { Missing } from "@/components/ui/Missing";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/config/site";
import { isPending } from "@/lib/pending";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo trata AndyCampers los datos personales que dejás en el sitio, según la Ley 25.326 de Protección de Datos Personales.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <>
      <main id="contenido">
        <section className="overflow-hidden bg-durazno px-4 pt-12 pb-12 sm:px-6 lg:px-10 lg:pt-16">
          <div className="mx-auto max-w-[1440px]">
            <h1 className="slab font-display-x text-[clamp(2.4rem,9vw,4.6rem)] uppercase">Privacidad</h1>
            <p className="titulo-cond mt-4 text-[1.5rem] text-forest">(cómo usamos los datos que dejás en el sitio)</p>
          </div>
        </section>

        <article className="bg-paper px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-3xl space-y-10 text-lg leading-relaxed text-ink/85 [&_h2]:titulo-cond [&_h2]:mb-3 [&_h2]:text-[2rem] [&_h2]:text-forest [&_h2]:uppercase">
            <Missing label="revisión legal de este texto antes de publicar" block />

            <section>
              <h2>Responsable</h2>
              <p>
                El responsable de la base de datos es {site.name}
                {isPending(site.legalName) ? (
                  <>
                    {" "}
                    (<Missing label={site.legalName} />)
                  </>
                ) : (
                  ` (${site.legalName})`
                )}
                . Podés escribirnos al WhatsApp{" "}
                {site.whatsapp.display}.
              </p>
            </section>

            <section>
              <h2>Qué datos juntamos</h2>
              <p>
                Cuando completás el formulario de cotización: nombre, WhatsApp, email (opcional), localidad y provincia, las respuestas sobre
                tu forma de viajar y tu compra, el vehículo con el que remolcarías el camper y la configuración que armaste (equipamiento y
                color). También registramos de qué página o campaña llegaste (parámetros UTM) para saber qué funciona.
              </p>
            </section>

            <section>
              <h2>Para qué los usamos</h2>
              <p>
                Solo para responder tu consulta, prepararte una cotización y hacer el seguimiento comercial. No vendemos ni cedemos tus datos.
                Se guardan en una planilla de uso interno y se usan herramientas de terceros para enviar avisos (correo y WhatsApp Business).
              </p>
            </section>

            <section>
              <h2>Medición y publicidad</h2>
              <p>
                El sitio puede usar Google Analytics y Meta Pixel para medir visitas y mostrar publicidad a quienes ya nos visitaron. No
                enviamos a esas herramientas tu nombre, teléfono ni email.
              </p>
            </section>

            <section>
              <h2>Tus derechos</h2>
              <p>
                Según la Ley 25.326, podés pedir acceso, rectificación, actualización o supresión de tus datos en cualquier momento
                escribiéndonos por WhatsApp. El acceso es gratuito en intervalos no menores a seis meses, salvo interés legítimo.
              </p>
              <p className="mt-4">
                La Agencia de Acceso a la Información Pública, órgano de control de la Ley 25.326, atiende las denuncias y reclamos de
                quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos
                personales.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
