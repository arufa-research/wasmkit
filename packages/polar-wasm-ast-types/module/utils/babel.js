import * as t from '@babel/types';
import { snake } from 'case';
export const propertySignature = (name, typeAnnotation, optional = false) => {
  return {
    type: 'TSPropertySignature',
    key: t.identifier(name),
    typeAnnotation,
    optional
  };
};
export const identifier = (name, typeAnnotation, optional = false) => {
  const type = t.identifier(name);
  type.typeAnnotation = typeAnnotation;
  type.optional = optional;
  return type;
};
export const tsTypeOperator = (typeAnnotation, operator) => {
  const obj = t.tsTypeOperator(typeAnnotation);
  obj.operator = operator;
  return obj;
};
export const getMessageProperties = msg => {
  if (msg.anyOf) return msg.anyOf;
  if (msg.oneOf) return msg.oneOf;
  if (msg.allOf) return msg.allOf;
  return [];
};
export const tsPropertySignature = (key, typeAnnotation, optional) => {
  const obj = t.tsPropertySignature(key, typeAnnotation);
  obj.optional = optional;
  return obj;
};
export const tsObjectPattern = (properties, typeAnnotation) => {
  const obj = t.objectPattern(properties);
  obj.typeAnnotation = typeAnnotation;
  return obj;
};
export const callExpression = (callee, _arguments, typeParameters) => {
  const callExpr = t.callExpression(callee, _arguments);
  callExpr.typeParameters = typeParameters;
  return callExpr;
};
export const bindMethod = name => {
  return t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.thisExpression(), t.identifier(name)), t.callExpression(t.memberExpression(t.memberExpression(t.thisExpression(), t.identifier(name)), t.identifier('bind')), [t.thisExpression()])));
};
export const typedIdentifier = (name, typeAnnotation, optional = false) => {
  const type = t.identifier(name);
  type.typeAnnotation = typeAnnotation;
  type.optional = optional;
  return type;
};
export const promiseTypeAnnotation = name => {
  return t.tsTypeAnnotation(t.tsTypeReference(t.identifier('Promise'), t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier(name))])));
};
export const classDeclaration = (name, body, implementsExressions = [], superClass = null) => {
  const declaration = t.classDeclaration(t.identifier(name), superClass, t.classBody(body));

  if (implementsExressions.length) {
    declaration.implements = implementsExressions;
  }

  return declaration;
};
export const classProperty = (name, typeAnnotation = null, isReadonly = false, isStatic = false) => {
  const prop = t.classProperty(t.identifier(name));
  if (isReadonly) prop.readonly = true;
  if (isStatic) prop.static = true;
  if (typeAnnotation) prop.typeAnnotation = typeAnnotation;
  return prop;
};
export const arrowFunctionExpression = (params, body, returnType, isAsync = false) => {
  const func = t.arrowFunctionExpression(params, body, isAsync);
  if (returnType) func.returnType = returnType;
  return func;
};
export const recursiveNamespace = (names, moduleBlockBody) => {
  if (!names || !names.length) return moduleBlockBody;
  const name = names.pop();
  return [t.exportNamedDeclaration(t.tsModuleDeclaration(t.identifier(name), t.tsModuleBlock(recursiveNamespace(names, moduleBlockBody))))];
};
export const arrayTypeNDimensions = (body, n) => {
  if (!n) return t.tsArrayType(body);
  return t.tsArrayType(arrayTypeNDimensions(body, n - 1));
};
export const FieldTypeAsts = {
  string: () => {
    return t.tsStringKeyword();
  },
  array: type => {
    return t.tsArrayType(FieldTypeAsts[type]());
  },
  Duration: () => {
    return t.tsTypeReference(t.identifier('Duration'));
  },
  Height: () => {
    return t.tsTypeReference(t.identifier('Height'));
  },
  Coin: () => {
    return t.tsTypeReference(t.identifier('Coin'));
  },
  Long: () => {
    return t.tsTypeReference(t.identifier('Long'));
  }
};
export const shorthandProperty = prop => {
  return t.objectProperty(t.identifier(prop), t.identifier(prop), false, true);
};
export const importStmt = (names, path) => {
  return t.importDeclaration(names.map(name => t.importSpecifier(t.identifier(name), t.identifier(name))), t.stringLiteral(path));
};
export const importAminoMsg = () => {
  return importStmt(['AminoMsg'], '@cosmjs/amino');
};
export const getFieldDimensionality = field => {
  let typeName = field.type;
  const isArray = typeName.endsWith('[]');
  let dimensions = 0;

  if (isArray) {
    dimensions = typeName.match(/\[\]/g).length - 1;
    typeName = typeName.replace(/\[\]/g, '');
  }

  return {
    typeName,
    dimensions,
    isArray
  };
};
export const memberExpressionOrIdentifier = names => {
  if (names.length === 1) {
    return t.identifier(names[0]);
  }

  if (names.length === 2) {
    const [b, a] = names;
    return t.memberExpression(t.identifier(a), t.identifier(b));
  }

  const [name, ...rest] = names;
  return t.memberExpression(memberExpressionOrIdentifier(rest), t.identifier(name));
};
export const memberExpressionOrIdentifierSnake = names => {
  if (names.length === 1) {
    return t.identifier(snake(names[0]));
  }

  if (names.length === 2) {
    const [b, a] = names;
    return t.memberExpression(t.identifier(snake(a)), t.identifier(snake(b)));
  }

  const [name, ...rest] = names;
  return t.memberExpression(memberExpressionOrIdentifierSnake(rest), t.identifier(snake(name)));
};