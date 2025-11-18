const { create } = require('xmlbuilder2')

function buildDirectoryXml({ user, domain, password }) {
  const document = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('document', { type: 'freeswitch/xml' })
    .ele('section', { name: 'directory' })
    .ele('domain', { name: domain || "$${domain}" })
    .ele('user', { id: user })
    .ele('params')
    .ele('param', { name: 'password', value: password }).up()
    .ele('param', { name: 'vm-password', value: password }).up()
    .ele('param', {
      name: 'dial-string',
      value: '{sip_invite_domain=${domain_name},presence_id=${dialed_user}@${dialed_domain}}${sofia_contact(${dialed_user}@${dialed_domain})}',
    }).up()
    .up()
    .ele('variables')
    .ele('variable', { name: 'toll_allow', value: 'domestic,international,local' }).up()
    .ele('variable', { name: 'accountcode', value: user }).up()
    .ele('variable', { name: 'user_context', value: 'default' }).up()
    .ele('variable', { name: 'effective_caller_id_name', value: `Extension ${user}` }).up()
    .ele('variable', { name: 'effective_caller_id_number', value: user }).up()
    .ele('variable', { name: 'outbound_caller_id_name', value: 'FreeSWITCH User' }).up()
    .ele('variable', { name: 'outbound_caller_id_number', value: user }).up()
    .ele('variable', { name: 'callgroup', value: 'techsupport' }).up()
    .up()
    .up()
    .up()
    .end({ prettyPrint: true })

  return document
}

function buildDialplanXml({ destination, context, domain }) {
  const sanitizedDestination = destination || '1000'
  const sanitizedDomain = domain || 'default'

  const document = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('document', { type: 'freeswitch/xml' })
    .ele('section', { name: 'dialplan' })
    .ele('context', { name: context })
    .ele('extension', { name: `Bridge ${sanitizedDestination}` })
    .ele('condition', { field: 'destination_number', expression: `^${sanitizedDestination}$` })
    .ele('action', { application: 'export', data: `dialed_ext=${sanitizedDestination}` }).up()
    .ele('action', { application: 'set', data: 'continue_on_fail=true' }).up()
    .ele('action', { application: 'bridge', data: `user/${sanitizedDestination}@${sanitizedDomain}` }).up()
    .ele('action', { application: 'hangup', data: 'NO_ROUTE_DESTINATION' }).up()
    .up()
    .up()
    .up()
    .end({ prettyPrint: true })

  return document
}

function emptyFSResponse() {
  const document = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('document', { type: 'freeswitch/xml' })
    .up()
    .end({ prettyPrint: true });
  return document;
}

module.exports = {
  buildDirectoryXml,
  buildDialplanXml,
  emptyFSResponse,
}
