---
inclusion: fileMatch
fileMatchPattern: "**/actions/**/*.java,**/struts-config.xml"
---

# Struts Action Pattern

This skill provides the template and best practices for creating new Struts Action classes in the SBC DLP application.

## Action Class Template

```java
package com.dd.actions;

import com.dd.dto.*;
import com.dd.process.*;
import com.dd.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang.StringUtils;
import org.apache.struts.action.*;
import javax.servlet.http.*;
import java.io.PrintWriter;

public class {Feature}Action extends DestinyActionParent {

    public ActionForward execute(ActionMapping mapping, ActionForm form,
                                 HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        
        String userAction = request.getParameter("userAction");
        
        if (StringUtils.isBlank(userAction)) {
            return handleInitialLoad(mapping, request, response);
        }
        
        switch (userAction) {
            case "Select":
                return handleSelect(mapping, request, response);
            case "Create":
                return handleCreate(mapping, request, response);
            case "Edit":
                return handleEdit(mapping, request, response);
            case "Delete":
                return handleDelete(mapping, request, response);
            default:
                return mapping.findForward("error");
        }
    }
    
    private ActionForward handleInitialLoad(ActionMapping mapping,
                                           HttpServletRequest request,
                                           HttpServletResponse response) {
        return mapping.findForward("success");
    }
    
    private ActionForward handleSelect(ActionMapping mapping,
                                      HttpServletRequest request,
                                      HttpServletResponse response) throws Exception {
        String id = request.getParameter("id");
        
        {Feature}HandlerWeb handler = ({Feature}HandlerWeb) 
            SessionUtility.getSessionAttribute(request, SessionConstants.{FEATURE}_HANDLER);
        
        if (handler == null) {
            handler = new {Feature}HandlerWeb();
            SessionUtility.setSessionAttribute(request, SessionConstants.{FEATURE}_HANDLER, handler);
        }
        
        {Feature}DTO dto = handler.get{Feature}(id);
        
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        ObjectMapper mapper = ObjectMapperFactory.getObjectMapper();
        out.print(mapper.writeValueAsString(dto));
        out.flush();
        
        return null;
    }
    
    private ActionForward handleCreate(ActionMapping mapping,
                                      HttpServletRequest request,
                                      HttpServletResponse response) throws Exception {
        ObjectMapper mapper = ObjectMapperFactory.getObjectMapper();
        {Feature}DTO dto = mapper.readValue(request.getReader(), {Feature}DTO.class);
        
        {Feature}HandlerWeb handler = ({Feature}HandlerWeb) 
            SessionUtility.getSessionAttribute(request, SessionConstants.{FEATURE}_HANDLER);
        
        {Feature}DTO result = handler.create{Feature}(dto);
        
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        out.print(mapper.writeValueAsString(result));
        out.flush();
        
        return null;
    }
    
    private ActionForward handleEdit(ActionMapping mapping,
                                    HttpServletRequest request,
                                    HttpServletResponse response) throws Exception {
        ObjectMapper mapper = ObjectMapperFactory.getObjectMapper();
        {Feature}DTO dto = mapper.readValue(request.getReader(), {Feature}DTO.class);
        
        {Feature}HandlerWeb handler = ({Feature}HandlerWeb) 
            SessionUtility.getSessionAttribute(request, SessionConstants.{FEATURE}_HANDLER);
        
        {Feature}DTO result = handler.update{Feature}(dto);
        
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        out.print(mapper.writeValueAsString(result));
        out.flush();
        
        return null;
    }
    
    private ActionForward handleDelete(ActionMapping mapping,
                                      HttpServletRequest request,
                                      HttpServletResponse response) throws Exception {
        String id = request.getParameter("id");
        
        {Feature}HandlerWeb handler = ({Feature}HandlerWeb) 
            SessionUtility.getSessionAttribute(request, SessionConstants.{FEATURE}_HANDLER);
        
        handler.delete{Feature}(id);
        
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        out.print("{\"success\": true}");
        out.flush();
        
        return null;
    }
}
```

## Struts Configuration

Add to `struts-config.xml`:

```xml
<action path="/{feature}"
        type="com.dd.actions.{Feature}Action"
        name="{feature}Form"
        scope="request"
        validate="false">
    <forward name="success" path="/WEB-INF/jsp/{feature}.jsp"/>
    <forward name="error" path="/WEB-INF/jsp/error.jsp"/>
</action>
```

## Key Patterns

### Session Management
```java
{Feature}HandlerWeb handler = ({Feature}HandlerWeb) 
    SessionUtility.getSessionAttribute(request, SessionConstants.{FEATURE}_HANDLER);

SessionUtility.setSessionAttribute(request, SessionConstants.{FEATURE}_HANDLER, handler);

SessionUtility.removeSessionAttribute(request, SessionConstants.{FEATURE}_HANDLER);
```

### JSON Response
```java
response.setContentType("application/json");
PrintWriter out = response.getWriter();
ObjectMapper mapper = ObjectMapperFactory.getObjectMapper();
out.print(mapper.writeValueAsString(dto));
out.flush();
return null; // Important: return null for AJAX responses
```

### Error Handling
```java
try {
    // Business logic
} catch (BusinessException e) {
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    response.setContentType("application/json");
    PrintWriter out = response.getWriter();
    out.print("{\"error\": \"" + e.getMessage() + "\"}");
    out.flush();
    return null;
}
```

## Best Practices

1. **Extend DestinyActionParent** - All actions must extend this base class
2. **Use userAction parameter** - Route different operations via userAction
3. **Session for handlers** - Store process handlers in session
4. **Return null for AJAX** - When writing JSON directly, return null
5. **Use ObjectMapperFactory** - Don't create new ObjectMapper instances
6. **Validate input** - Always validate request parameters
7. **Handle exceptions** - Catch and return appropriate error responses
8. **No comments in code** - The code documents itself through clear naming and structure

## Admin JSON Action Pattern (for Vue 3 popup pages)

Admin actions that serve as JSON APIs for standalone Vue 3 popup pages follow a slightly different pattern. They extend `Action` directly (not `DestinyActionParent`) to avoid session-dependent behavior that doesn't apply to simple CRUD admin screens.

```java
package com.dd.admin.actions;

import com.dd.util.ObjectMapperFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.util.Map;

public class Admin{Feature}Action extends Action {

    public ActionForward execute(ActionMapping mapping, ActionForm form,
                                 HttpServletRequest request, HttpServletResponse response) throws Exception {

        String action = request.getParameter("action");
        if (action == null) action = "list";

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        ObjectMapper mapper = ObjectMapperFactory.createConfiguredMapper();

        switch (action) {
            case "list":
                handleList(request, out, mapper);
                break;
            case "get":
                handleGet(request, out, mapper);
                break;
            case "save":
                handleSave(request, out, mapper);
                break;
            case "delete":
                handleDelete(request, out, mapper);
                break;
            default:
                out.print(mapper.writeValueAsString(Map.of("error", "Unknown action: " + action)));
                break;
        }

        out.flush();
        return null;
    }
}
```

### Key differences from regular actions:
- Extends `Action` (not `DestinyActionParent`)   no session handler dependency
- Uses `action` parameter (lowercase)   not `userAction`
- Package: `com.dd.admin.actions`   separate from main actions
- No session state   admin CRUD is stateless, reads directly from DAO
- Struts mapping: `<action path="/admin/{feature}" type="com.dd.admin.actions.Admin{Feature}Action" scope="request" validate="false"></action>`

### Permission Handling (canEdit pattern)

Admin actions MUST return `canEdit` in the List response by checking the session's `sbc.admin_edit` ability server-side. NEVER rely on URL parameters for permission checks   that's client-side and trivially bypassable.

```java
private static final String ADMIN_EDIT_ABILITY = "sbc.admin_edit";

// In the "list" handler:
Map<String, Object> listResult = new HashMap<>();
listResult.put("items", itemList);
listResult.put("canEdit", hasAdminEditAbility(request.getSession()));
result = listResult;

// Helper method:
private boolean hasAdminEditAbility(HttpSession session) {
    try {
        SAMLAssertionAttributes samlAttributes = (SAMLAssertionAttributes)
            session.getAttribute(SessionConstants.MYID_SAML_ASSERTION_DATA);
        if (samlAttributes != null) {
            return samlAttributes.hasFunctionalAbility(ADMIN_EDIT_ABILITY);
        }
        KeystoneSecurityClient keystoneClient =
            KeystoneSecurityClientCacheManager.getKeystoneSecurityClient(session);
        if (keystoneClient != null) {
            return keystoneClient.hasFunctionalAbility(ADMIN_EDIT_ABILITY);
        }
    } catch (Exception e) {
    }
    return false;
}
```

The frontend reads `canEdit` from the response and conditionally renders New/Edit/Delete buttons:
```javascript
const canEdit = ref(false)

async function loadList() {
  const data = await fetchJSON('/destiny/admin/myAction.do?action=list')
  if (data) {
    items.value = data.items || []
    canEdit.value = data.canEdit === true
  }
}
```

## JSON Branch Pattern (eventBus=true)

When adding Vue 3 support to an existing action that currently forwards to a JSP, add a JSON branch that checks for the `eventBus=true` parameter. This preserves backward compatibility with the JSP flow while enabling the Vue component to fetch data via AJAX.

```java
public ActionForward execute(ActionMapping mapping, ActionForm form,
                             HttpServletRequest request, HttpServletResponse response)
        throws Exception {
    
    // ... existing logic to load data ...
    
    String eventBus = request.getParameter("eventBus");
    if ("true".equals(eventBus)) {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        ObjectMapper mapper = ObjectMapperFactory.getObjectMapper();
        out.print(mapper.writeValueAsString(dataList));
        out.flush();
        return null;
    }
    
    // Existing JSP forward (unchanged)
    request.setAttribute("dataList", dataList);
    return mapping.findForward("success");
}
```

## Common Mistakes to Avoid

- Don't create stateless actions - use session for state
- Don't return ActionForward for AJAX calls - return null after writing JSON
- Don't create new ObjectMapper - use ObjectMapperFactory
- Don't forget to flush PrintWriter
- Don't skip input validation
- Don't ignore session cleanup
