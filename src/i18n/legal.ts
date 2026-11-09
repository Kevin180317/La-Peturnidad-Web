type Block =
  | { type: "p"; html: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };

type Section = {
  id?: string;
  title: string;
  blocks: Block[];
};

type LegalContent = {
  updated: string;
  sections: Section[];
};

const linkClass = "text-principal underline";

export const termsContent: Record<"es" | "en", LegalContent> = {
  es: {
    updated: "Última actualización: 3 de noviembre de 2026",
    sections: [
      {
        title: "1. Aceptación",
        blocks: [
          {
            type: "p",
            html: `Al crear una cuenta o usar Lucky Tracker aceptas estos Términos y la Política de Privacidad (<a class="${linkClass}" href="/policy">https://luckytracker.com.mx/policy</a>). Si no estás de acuerdo, no uses la aplicación.`,
          },
        ],
      },
      {
        title: "2. Quién puede usarla",
        blocks: [
          {
            type: "p",
            html: "Debes tener al menos 18 años y darnos información veraz. Eres responsable de la seguridad de tu contraseña y de lo que ocurra en tu cuenta.",
          },
        ],
      },
      {
        title: "3. Qué es Lucky Tracker",
        blocks: [
          {
            type: "p",
            html: "Una plataforma comunitaria para registrar mascotas, publicar alertas de mascotas perdidas o encontradas, comunicarte con otras personas y compartir contenido. Lucky Tracker no es un servicio de rescate, veterinario ni de seguridad.",
          },
        ],
      },
      {
        title: "4. Alertas colaborativas: sin garantía",
        blocks: [
          {
            type: "p",
            html: "Las alertas se envían a usuarios cercanos, pero <strong>no garantizamos</strong> que alguien las vea, que una mascota sea encontrada ni que la información publicada por otros sea correcta o esté actualizada. Las notificaciones pueden retrasarse o no llegar. No sustituyas otras acciones (autoridades, veterinarias, refugios, carteles).",
          },
        ],
      },
      {
        title: "5. Seguridad al entregar o recibir una mascota",
        blocks: [
          {
            type: "ul",
            items: [
              "Verifica que la persona sea el dueño real (fotos, señas particulares, cartilla, historial).",
              "Acuerda el encuentro en un lugar público y con luz, preferentemente acompañado.",
              "No compartas más datos personales de los necesarios ni hagas pagos por adelantado a desconocidos.",
              "Si algo te parece sospechoso, no te reúnas y repórtalo desde la app.",
            ],
          },
          {
            type: "p",
            html: "Lucky Tracker no verifica la identidad de los usuarios ni participa en los encuentros.",
          },
        ],
      },
      {
        title: "6. Conducta prohibida",
        blocks: [
          { type: "p", html: "No puedes:" },
          {
            type: "ul",
            items: [
              "Publicar contenido ilegal, violento, sexual, discriminatorio, de acoso o que promueva maltrato animal.",
              "Suplantar a otra persona ni publicar datos personales de terceros sin su permiso.",
              "Publicar alertas, reportes o información falsa o engañosa, ni usar la plataforma para estafas.",
              "Vender animales o usar la app con fines comerciales no autorizados.",
              "Enviar spam o mensajes masivos no solicitados.",
              "Intentar acceder a cuentas ajenas, burlar los controles de seguridad, extraer datos de forma automatizada o interferir con el funcionamiento de la app.",
            ],
          },
        ],
      },
      {
        title: "7. Tu contenido",
        blocks: [
          {
            type: "p",
            html: "Conservas la propiedad del contenido que publicas (fotos, textos, mensajes). Nos otorgas una licencia no exclusiva, gratuita y limitada para almacenarlo, mostrarlo y enviarlo a otros usuarios dentro de la app con el único fin de operar el servicio. Esta licencia termina cuando eliminas el contenido o tu cuenta. Declaras que tienes derecho a publicar lo que subes.",
          },
        ],
      },
      {
        title: "8. Moderación",
        blocks: [
          {
            type: "p",
            html: "Puedes <strong>reportar</strong> contenido o usuarios y <strong>bloquear</strong> a otras personas desde la app. Podemos revisar reportes, <strong>retirar contenido</strong> que incumpla estos Términos y <strong>suspender o eliminar cuentas</strong>, con o sin aviso previo, si hay incumplimientos graves o repetidos. Las decisiones de moderación se toman con el criterio razonable de nuestro equipo.",
          },
        ],
      },
      {
        title: "9. Eliminar tu cuenta",
        blocks: [
          {
            type: "p",
            html: "Puedes hacerlo cuando quieras desde Perfil → Eliminar cuenta (ver Política de Privacidad, sección 7).",
          },
        ],
      },
      {
        title: "10. Responsabilidad",
        blocks: [
          {
            type: "p",
            html: 'La aplicación se ofrece "tal cual". En la medida permitida por la ley, Lucky Tracker no responde por el contenido o la conducta de los usuarios, por encuentros entre personas, ni por la pérdida, daño o no localización de una mascota. Nada en estos Términos limita derechos del consumidor que la ley no permita limitar.',
          },
        ],
      },
      {
        title: "11. Cambios",
        blocks: [
          {
            type: "p",
            html: "Podemos actualizar estos Términos. Publicaremos la versión nueva con su fecha y, si el cambio es importante, te avisaremos en la app. Si sigues usando Lucky Tracker después del cambio, lo aceptas.",
          },
        ],
      },
      {
        title: "12. Ley aplicable",
        blocks: [
          {
            type: "p",
            html: "Estos Términos se rigen por las leyes de México. Para su interpretación, las partes se someten a los tribunales competentes de Tijuana, Baja California.",
          },
        ],
      },
      {
        title: "13. Contacto",
        blocks: [
          {
            type: "p",
            html: `<!--email_off--><a class="${linkClass}" href="mailto:contact@prometheustij.com">contact@prometheustij.com</a><!--/email_off-->`,
          },
        ],
      },
    ],
  },
  en: {
    updated: "Last updated: November 3, 2026",
    sections: [
      {
        title: "1. Acceptance",
        blocks: [
          {
            type: "p",
            html: `By creating an account or using Lucky Tracker you accept these Terms and the Privacy Policy (<a class="${linkClass}" href="/en/policy">https://luckytracker.com.mx/policy</a>). If you do not agree, do not use the application.`,
          },
        ],
      },
      {
        title: "2. Who can use it",
        blocks: [
          {
            type: "p",
            html: "You must be at least 18 years old and provide truthful information. You are responsible for the security of your password and for what happens on your account.",
          },
        ],
      },
      {
        title: "3. What Lucky Tracker is",
        blocks: [
          {
            type: "p",
            html: "A community platform to register pets, post alerts about lost or found pets, communicate with other people, and share content. Lucky Tracker is not a rescue, veterinary, or security service.",
          },
        ],
      },
      {
        title: "4. Collaborative alerts: no guarantee",
        blocks: [
          {
            type: "p",
            html: "Alerts are sent to nearby users, but <strong>we do not guarantee</strong> that anyone will see them, that a pet will be found, or that information posted by others is correct or up to date. Notifications may be delayed or may not arrive. Do not replace other actions (authorities, veterinarians, shelters, posters).",
          },
        ],
      },
      {
        title: "5. Safety when handing over or receiving a pet",
        blocks: [
          {
            type: "ul",
            items: [
              "Verify that the person is the real owner (photos, distinguishing marks, vaccination card, history).",
              "Arrange the meeting in a public, well-lit place, preferably accompanied.",
              "Do not share more personal data than necessary or make advance payments to strangers.",
              "If something seems suspicious, do not meet and report it from the app.",
            ],
          },
          {
            type: "p",
            html: "Lucky Tracker does not verify users' identities or participate in meetings.",
          },
        ],
      },
      {
        title: "6. Prohibited conduct",
        blocks: [
          { type: "p", html: "You may not:" },
          {
            type: "ul",
            items: [
              "Post illegal, violent, sexual, discriminatory, harassing content, or content that promotes animal abuse.",
              "Impersonate another person or post third parties' personal data without their permission.",
              "Post false or misleading alerts, reports, or information, or use the platform for scams.",
              "Sell animals or use the app for unauthorized commercial purposes.",
              "Send spam or unsolicited mass messages.",
              "Attempt to access other people's accounts, bypass security controls, extract data automatically, or interfere with the app's operation.",
            ],
          },
        ],
      },
      {
        title: "7. Your content",
        blocks: [
          {
            type: "p",
            html: "You retain ownership of the content you post (photos, texts, messages). You grant us a non-exclusive, free, limited license to store, display, and send it to other users within the app for the sole purpose of operating the service. This license ends when you delete the content or your account. You represent that you have the right to post what you upload.",
          },
        ],
      },
      {
        title: "8. Moderation",
        blocks: [
          {
            type: "p",
            html: "You can <strong>report</strong> content or users and <strong>block</strong> other people from the app. We may review reports, <strong>remove content</strong> that violates these Terms, and <strong>suspend or delete accounts</strong>, with or without prior notice, if there are serious or repeated violations. Moderation decisions are made at our team's reasonable discretion.",
          },
        ],
      },
      {
        title: "9. Delete your account",
        blocks: [
          {
            type: "p",
            html: "You can do so at any time from Profile → Delete account (see Privacy Policy, section 7).",
          },
        ],
      },
      {
        title: "10. Liability",
        blocks: [
          {
            type: "p",
            html: 'The application is offered "as is". To the extent permitted by law, Lucky Tracker is not responsible for users\' content or conduct, for meetings between people, or for the loss, damage, or failure to locate a pet. Nothing in these Terms limits consumer rights that the law does not allow to be limited.',
          },
        ],
      },
      {
        title: "11. Changes",
        blocks: [
          {
            type: "p",
            html: "We may update these Terms. We will publish the new version with its date and, if the change is important, notify you in the app. If you continue using Lucky Tracker after the change, you accept it.",
          },
        ],
      },
      {
        title: "12. Governing law",
        blocks: [
          {
            type: "p",
            html: "These Terms are governed by the laws of Mexico. For their interpretation, the parties submit to the competent courts of Tijuana, Baja California.",
          },
        ],
      },
      {
        title: "13. Contact",
        blocks: [
          {
            type: "p",
            html: `<!--email_off--><a class="${linkClass}" href="mailto:contact@prometheustij.com">contact@prometheustij.com</a><!--/email_off-->`,
          },
        ],
      },
    ],
  },
};

const email = `<!--email_off--><a class="${linkClass}" href="mailto:contact@prometheustij.com">contact@prometheustij.com</a><!--/email_off-->`;
const address = "Fresnos 18, Ramirez, 22115 Tijuana, B.C.";

export const policyContent: Record<"es" | "en", LegalContent> = {
  es: {
    updated: "Última actualización: 3 de noviembre de 2026",
    sections: [
      {
        title: "1. Responsable",
        blocks: [
          {
            type: "p",
            html: `Prometheus R&D, con domicilio en ${address}, es responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Contacto: ${email}.`,
          },
        ],
      },
      {
        title: "2. Datos que recopilamos",
        blocks: [
          { type: "p", html: "Al usar la aplicación Lucky Tracker recopilamos:" },
          {
            type: "ul",
            items: [
              "<strong>Cuenta:</strong> correo electrónico y contraseña (la contraseña se guarda cifrada; no podemos verla).",
              "<strong>Perfil:</strong> nombre, apellido, teléfono, fecha de nacimiento, dirección (calle, colonia, ciudad y código postal) y foto de perfil.",
              "<strong>Mascotas:</strong> nombre, especie, raza, tamaño, descripción y fotos.",
              "<strong>Contenido que publicas:</strong> publicaciones, comentarios, anuncios, historias de éxito, grupos y sus fotos.",
              "<strong>Mensajes:</strong> conversaciones privadas y de grupo.",
              "<strong>Alertas:</strong> alertas de mascota perdida (mascota, última ubicación vista, fotos) y reportes de mascota encontrada (fotos, ubicación, nota y datos de contacto que elijas compartir).",
              "<strong>Seguridad y moderación:</strong> usuarios que bloqueas y reportes que envías o recibes.",
              "<strong>Notificaciones:</strong> token del dispositivo para enviarte avisos y tus preferencias de notificación.",
              "<strong>Técnicos:</strong> datos básicos de la sesión necesarios para que la app funcione.",
            ],
          },
          {
            type: "p",
            html: "No recopilamos tu ubicación GPS: la app no solicita permiso de ubicación. Tu zona se basa en la colonia que escribes en tu perfil.",
          },
        ],
      },
      {
        title: "3. Para qué usamos tus datos",
        blocks: [
          {
            type: "ul",
            items: [
              "Crear y administrar tu cuenta y tu perfil.",
              "Mostrar tu nombre, foto y ciudad a otros usuarios.",
              "<strong>Alertas a vecinos:</strong> cuando alguien publica una alerta de mascota perdida, enviamos una notificación a los usuarios cuya colonia coincide exactamente con la de la alerta. Para eso comparamos las colonias; <strong>tu dirección completa no se muestra a otros usuarios</strong>.",
              "Permitir que quien encontró una mascota y su dueño se pongan en contacto.",
              "Mensajería, comentarios, grupos y publicaciones.",
              "Moderación: atender reportes, retirar contenido y suspender cuentas que incumplan los Términos.",
              "Enviar notificaciones push, avisos en la bandeja de la app y correos de acceso (confirmación, recuperación de contraseña).",
            ],
          },
          {
            type: "p",
            html: "No usamos tus datos para publicidad ni los vendemos.",
          },
        ],
      },
      {
        title: "4. Qué ven otros usuarios",
        blocks: [
          {
            type: "ul",
            items: [
              "<strong>Siempre (cualquier usuario con sesión):</strong> tu nombre, foto de perfil y ciudad, junto con el contenido que publiques.",
              "<strong>Teléfono:</strong> solo se comparte en dos casos: (a) si publicas una alerta de mascota perdida, los usuarios de tu misma colonia pueden ver tu nombre y llamarte; (b) si reportas una mascota encontrada, el dueño de la alerta recibe el contacto que compartiste.",
              "<strong>Dirección y fecha de nacimiento:</strong> no son visibles para otros usuarios. Solo el personal de moderación puede consultarlos cuando es necesario para atender un reporte.",
              "<strong>Mensajes:</strong> solo los ven las personas de la conversación.",
            ],
          },
        ],
      },
      {
        title: "5. Proveedores que procesan datos por nuestra cuenta",
        blocks: [
          {
            type: "p",
            html: "Usamos estos servicios para operar la aplicación. Reciben únicamente los datos necesarios para su función:",
          },
          {
            type: "table",
            head: ["Proveedor", "Para qué", "Datos"],
            rows: [
              [
                "Supabase",
                "Base de datos, autenticación y almacenamiento de archivos (servidores en Estados Unidos, us-west-1)",
                "Todos los datos de la sección 2",
              ],
              [
                "Google Firebase Cloud Messaging",
                "Notificaciones push",
                "Token del dispositivo y el texto de la notificación",
              ],
              [
                "Resend",
                "Envío de correos de acceso",
                "Correo electrónico y contenido del mensaje",
              ],
              [
                "Expo",
                "Compilación de la app",
                "Sin datos personales de usuarios, salvo diagnósticos técnicos de la app",
              ],
            ],
          },
          {
            type: "p",
            html: "Estos proveedores pueden almacenar o procesar datos fuera de México. No vendemos tus datos. Solo los transferimos a autoridades cuando una ley o una orden judicial lo exija.",
          },
        ],
      },
      {
        title: "6. Conservación",
        blocks: [
          {
            type: "ul",
            items: [
              "Conservamos tus datos mientras tu cuenta esté activa.",
              "Al eliminar tu cuenta se borran tus datos (ver sección 7). Los archivos y datos se eliminan de forma inmediata en nuestros sistemas.",
              "No mantenemos copias de respaldo de los datos de usuarios.",
              "Los reportes de moderación en los que aparezcas como persona reportada se eliminan junto con tu cuenta.",
            ],
          },
        ],
      },
      {
        id: "eliminar-cuenta",
        title: "7. Cómo eliminar tu cuenta",
        blocks: [
          {
            type: "p",
            html: `Desde la app: <strong>Perfil → Eliminar cuenta</strong> y confirma. También puedes escribir a ${email} desde el correo de tu cuenta.`,
          },
          {
            type: "p",
            html: "Al eliminar tu cuenta se borra de forma permanente:",
          },
          {
            type: "ul",
            items: [
              "Tu perfil, foto de perfil, preferencias y tokens de notificación.",
              "Tus mascotas, publicaciones, anuncios, historias, comentarios, alertas y reportes de mascota encontrada.",
              "Tus mensajes, tus conversaciones privadas, tus seguidores/seguidos y tus bloqueos.",
              "Los grupos que creaste y los comentarios de otras personas en tus publicaciones.",
              "Todos tus archivos (fotos) almacenados.",
            ],
          },
          { type: "p", html: "No se puede deshacer." },
        ],
      },
      {
        title: "8. Derechos ARCO",
        blocks: [
          {
            type: "p",
            html: `Tienes derecho a <strong>Acceder</strong> a tus datos, <strong>Rectificarlos</strong>, <strong>Cancelarlos</strong> u <strong>Oponerte</strong> a su tratamiento. Puedes editar la mayoría de tus datos desde Perfil → Editar perfil, eliminar tu cuenta desde la app o enviar tu solicitud a ${email} indicando tu nombre, correo de la cuenta y qué derecho ejerces. Responderemos en un máximo de 20 días hábiles. Domicilio para solicitudes: ${address}.`,
          },
        ],
      },
      {
        title: "9. Menores de edad",
        blocks: [
          {
            type: "p",
            html: "La aplicación está dirigida a personas de 18 años o más. Si detectamos una cuenta de una persona menor, la eliminaremos.",
          },
        ],
      },
      {
        title: "10. Seguridad",
        blocks: [
          {
            type: "p",
            html: "Usamos conexiones cifradas (HTTPS), contraseñas cifradas y control de acceso por usuario en la base de datos para que cada persona solo consulte la información que le corresponde. Ningún sistema es 100 % seguro: si ocurre una vulneración que te afecte, te lo notificaremos.",
          },
        ],
      },
      {
        title: "11. Cambios a esta política",
        blocks: [
          {
            type: "p",
            html: "Si cambiamos esta política, publicaremos la nueva versión aquí con su fecha y, si el cambio es importante, te avisaremos dentro de la app.",
          },
        ],
      },
      {
        title: "12. Contacto",
        blocks: [{ type: "p", html: `${email} — ${address}` }],
      },
    ],
  },
  en: {
    updated: "Last updated: November 3, 2026",
    sections: [
      {
        title: "1. Controller",
        blocks: [
          {
            type: "p",
            html: `Prometheus R&D, with address at ${address}, is responsible for the processing of your personal data in accordance with the Federal Law on Protection of Personal Data Held by Private Parties (LFPDPPP). Contact: ${email}.`,
          },
        ],
      },
      {
        title: "2. Data we collect",
        blocks: [
          {
            type: "p",
            html: "By using the Lucky Tracker application we collect:",
          },
          {
            type: "ul",
            items: [
              "<strong>Account:</strong> email address and password (the password is stored encrypted; we cannot see it).",
              "<strong>Profile:</strong> first name, last name, phone number, date of birth, address (street, neighborhood, city and postal code) and profile photo.",
              "<strong>Pets:</strong> name, species, breed, size, description and photos.",
              "<strong>Content you post:</strong> posts, comments, listings, success stories, groups and their photos.",
              "<strong>Messages:</strong> private and group conversations.",
              "<strong>Alerts:</strong> lost pet alerts (pet, last seen location, photos) and found pet reports (photos, location, note and contact details you choose to share).",
              "<strong>Security and moderation:</strong> users you block and reports you send or receive.",
              "<strong>Notifications:</strong> device token to send you notifications and your notification preferences.",
              "<strong>Technical:</strong> basic session data necessary for the app to work.",
            ],
          },
          {
            type: "p",
            html: "We do not collect your GPS location: the app does not request location permission. Your area is based on the neighborhood you enter in your profile.",
          },
        ],
      },
      {
        title: "3. How we use your data",
        blocks: [
          {
            type: "ul",
            items: [
              "Create and manage your account and profile.",
              "Show your name, photo and city to other users.",
              "<strong>Neighbor alerts:</strong> when someone posts a lost pet alert, we send a notification to users whose neighborhood exactly matches the alert's neighborhood. To do this we compare neighborhoods; <strong>your full address is not shown to other users</strong>.",
              "Allow the person who found a pet and its owner to get in touch.",
              "Messaging, comments, groups and posts.",
              "Moderation: handle reports, remove content and suspend accounts that violate the Terms.",
              "Send push notifications, in-app inbox notices and access emails (confirmation, password recovery).",
            ],
          },
          {
            type: "p",
            html: "We do not use your data for advertising and we do not sell it.",
          },
        ],
      },
      {
        title: "4. What other users see",
        blocks: [
          {
            type: "ul",
            items: [
              "<strong>Always (any logged-in user):</strong> your name, profile photo and city, along with the content you post.",
              "<strong>Phone:</strong> it is only shared in two cases: (a) if you post a lost pet alert, users in your same neighborhood can see your name and call you; (b) if you report a found pet, the alert owner receives the contact you shared.",
              "<strong>Address and date of birth:</strong> they are not visible to other users. Only moderation staff can consult them when necessary to handle a report.",
              "<strong>Messages:</strong> only the people in the conversation can see them.",
            ],
          },
        ],
      },
      {
        title: "5. Providers that process data on our behalf",
        blocks: [
          {
            type: "p",
            html: "We use these services to operate the application. They receive only the data necessary for their function:",
          },
          {
            type: "table",
            head: ["Provider", "Purpose", "Data"],
            rows: [
              [
                "Supabase",
                "Database, authentication and file storage (servers in the United States, us-west-1)",
                "All data in section 2",
              ],
              [
                "Google Firebase Cloud Messaging",
                "Push notifications",
                "Device token and notification text",
              ],
              [
                "Resend",
                "Sending access emails",
                "Email address and message content",
              ],
              [
                "Expo",
                "App compilation",
                "No user personal data, except technical app diagnostics",
              ],
            ],
          },
          {
            type: "p",
            html: "These providers may store or process data outside Mexico. We do not sell your data. We only transfer it to authorities when required by law or a court order.",
          },
        ],
      },
      {
        title: "6. Retention",
        blocks: [
          {
            type: "ul",
            items: [
              "We retain your data while your account is active.",
              "When you delete your account, your data is erased (see section 7). Files and data are deleted immediately from our systems.",
              "We do not keep backup copies of user data.",
              "Moderation reports in which you appear as the reported person are deleted along with your account.",
            ],
          },
        ],
      },
      {
        id: "eliminar-cuenta",
        title: "7. How to delete your account",
        blocks: [
          {
            type: "p",
            html: `From the app: <strong>Profile → Delete account</strong> and confirm. You can also write to ${email} from your account's email address.`,
          },
          {
            type: "p",
            html: "When you delete your account, the following is permanently erased:",
          },
          {
            type: "ul",
            items: [
              "Your profile, profile photo, preferences and notification tokens.",
              "Your pets, posts, listings, stories, comments, alerts and found pet reports.",
              "Your messages, private conversations, followers/following and blocks.",
              "Groups you created and other people's comments on your posts.",
              "All your stored files (photos).",
            ],
          },
          { type: "p", html: "It cannot be undone." },
        ],
      },
      {
        title: "8. ARCO rights",
        blocks: [
          {
            type: "p",
            html: `You have the right to <strong>Access</strong> your data, <strong>Rectify</strong> it, <strong>Cancel</strong> it, or <strong>Object</strong> to its processing. You can edit most of your data from Profile → Edit profile, delete your account from the app, or send your request to ${email} stating your name, the account email and which right you are exercising. We will respond within a maximum of 20 business days. Address for requests: ${address}.`,
          },
        ],
      },
      {
        title: "9. Minors",
        blocks: [
          {
            type: "p",
            html: "The application is intended for people aged 18 or older. If we detect an account belonging to a minor, we will delete it.",
          },
        ],
      },
      {
        title: "10. Security",
        blocks: [
          {
            type: "p",
            html: "We use encrypted connections (HTTPS), encrypted passwords and per-user access control in the database so that each person can only access the information that corresponds to them. No system is 100% secure: if a breach affects you, we will notify you.",
          },
        ],
      },
      {
        title: "11. Changes to this policy",
        blocks: [
          {
            type: "p",
            html: "If we change this policy, we will publish the new version here with its date and, if the change is important, we will notify you in the app.",
          },
        ],
      },
      {
        title: "12. Contact",
        blocks: [{ type: "p", html: `${email} — ${address}` }],
      },
    ],
  },
};
