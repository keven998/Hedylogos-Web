# 代码规范说明

## 基本要求

缩进：         js:2空格  css+html:4空格
变量名：       驼峰
文件夹命名：    中划线 sample-display/
文件命名：      下划线 sample_display

## javaScript代码格式规范（**注意其中的空格**, 本规范为当前js主流规范）

下面的示意包括：变量声明，变量复制，函数定义，if，for，switch这些常用的情形。

``` javascript
  var func = function (value) {
    if (typeof value === 'object' && value !== null) {
      for (var i = 0; i < builtinConverters.length; i++) {
        var converter = builtinConverters[i];
        if (converter.matchJSONValue(value)) {
          return converter.fromJSONValue(value);
        }
      }
    }
    switch (EJSON._isCustomType(a) + EJSON._isCustomType(b)) {
      case 1: return false;break;
      case 2: return EJSON.equals(EJSON.toJSONValue(a), EJSON.toJSONValue(b));break;
      default:
    }
    return value;
  };
```

## 其它