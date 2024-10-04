---
title: web 应用安全认证
date: 2020-11-17 11:56:04
tags:
 - spring-boot
 - spring-security
 - java
---

  这篇指南带你创建一个Spring Security 管理资源安全的简单的 web 应用。

<!-- more -->
## 你将会搭建…

一个 Spring MVC 的应用，页面被一个登陆表单保护，只有特定的用户可以访问。

## 你需要…

* 15分钟时间
* 你喜欢的编辑器或 IDE
* JDK1.8+
* Gradle 4+ 或 Maven3.2+
* 可以直接直接在以下 IDE 中导入代码：
  * [Spring Tool Suite(STS)](https://spring.io/guides/gs/sts)
  * [IntelliJ IDEA](https://spring.io/guides/gs/intellij-idea/)

## 如何完成指南

  跟大多数 Spring 的指南一样，你需要从一个骨架项目启动，一步一步完成；或者直接跳过你已经很熟悉的配置步骤。两种方式得到的代码都能正确运行。

  从骨架项目开始，移步[从 Spring 启动器开始](https://spring.io/guides/gs/securing-web/#scratch)。

  跳过基本步骤，做如下几步：

 * [下载](https://github.com/spring-guides/gs-securing-web/archive/master.zip)并解压源码项目或用 [Git](https://spring.io/understanding/Git) 命令：

``` bash
git clone https://github.com/spring-guides/gs-securing-web.git
```

 * 打开到目录  `gs-securing-web/initial`
 * 跳到[创建不安全的应用]()

  当你完成后，可以对比 `gs-securing-web/complete` 检查自己的代码。

## 从 Spring 启动器开始

  所有 Spring 应用都需要从 Spring 启动器开始。启动器提供快速的方式导入所有需要的依赖并自动执行很多启动项。本例需要 Spring Web 和 Thymeleaf 依赖。

  下面是选择 Maven 时需要创建的 `pom/xml` 文件。

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.3.2.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.example</groupId>
	<artifactId>securing-web</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>securing-web</name>
	<description>Demo project for Spring Boot</description>

	<properties>
		<java.version>1.8</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-thymeleaf</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
			<exclusions>
				<exclusion>
					<groupId>org.junit.vintage</groupId>
					<artifactId>junit-vintage-engine</artifactId>
				</exclusion>
			</exclusions>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```

  下面是选择 Gradle 时需要创建的 `build.gradle` 文件。

``` gradle
plugins {
	id 'org.springframework.boot' version '2.3.2.RELEASE'
	id 'io.spring.dependency-management' version '1.0.8.RELEASE'
	id 'java'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '1.8'

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	testImplementation('org.springframework.boot:spring-boot-starter-test') {
		exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
	}
}

test {
	useJUnitPlatform()
}
```

## 创建不安全的 web 应用

  在应用安全组件到 web 应用中前，需要先有一个 web 应用。本节带你创建一个简单的 web 应用程序，并在下一节中使用 Spring Security 接入安全。

  应用包含 2 个简单页面：首页和“Hello World”页面。首页用如下 Thymeleaf 模板定义（位于）`src/main/resources/templates/home.html`：

``` html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="https://www.thymeleaf.org" xmlns:sec="https://www.thymeleaf.org/thymeleaf-extras-springsecurity3">
    <head>
        <title>Spring Security Example</title>
    </head>
    <body>
        <h1>Welcome!</h1>

        <p>Click <a th:href="@{/hello}">here</a> to see a greeting.</p>
    </body>
</html>
```

  视图只是简单的包含一个指向 `/hello`页面的链接，页面定义如下（位于`src/main/resources/templates/hello.html`）：

``` html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="https://www.thymeleaf.org"
      xmlns:sec="https://www.thymeleaf.org/thymeleaf-extras-springsecurity3">
    <head>
        <title>Hello World!</title>
    </head>
    <body>
        <h1>Hello world!</h1>
    </body>
</html>
```

  这个 web 应用程序是基于 Spring MVC 的，因此需要配置Spring MVC 让视图控制器暴露出这些模板，下面列出（位于 src/main/java/com/example/securingweb/MvcConfig.java）展示了 Spring MVC 应用的配置类：

``` java 
package com.example.securingweb;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

	public void addViewControllers(ViewControllerRegistry registry) {
		registry.addViewController("/home").setViewName("home");
		registry.addViewController("/").setViewName("home");
		registry.addViewController("/hello").setViewName("hello");
		registry.addViewController("/login").setViewName("login");
	}

}
```

`addViewControllers()` 方法（重写了 `WebMvcConfigurer` 类的同名方法）添加了 4  个视图控制器。2 个关联了定义在 home.html 文件的 home 视图，另 1 个关联了hello.html 文件的 hello 视图。第四个视图控制器关联了 login 视图，下一节中会创建。

  此时，你可以跳转到“运行应用程序”并且运行不用登录就可访问任意位置的应用程序。

  既然此时应用程序还没接入安全，这时来添加安全组件。

## 配置 Spring Security

  假设你希望阻止未授权用户访问 `/hello` 路径下的页面。当前，访问者点击首页链接，将会不受阻止看到问候页。你需要添加一层屏障迫使访问者看到页面前必须登录。

  通过集成 Spring Security 到项目中实现。当 Spring Security 位于类路径下时，Spring [自动将所有 HTTP 接口](https://docs.spring.io/spring-boot/docs/2.3.2.RELEASE/reference/htmlsingle/#boot-features-security)用 “basic”  鉴权。不过你可以继续自定义安全配置。首先需要添加 Spring Security 到类路径下。

  使用 Gradle，添加以下 2 行到 `build.gradle` 文件的 `dependencies` 一级下，（一个用在应用中，一个用来测试）：

``` gradle
implementation 'org.springframework.boot:spring-boot-starter-security'
implementation 'org.springframework.security:spring-security-test'
```

  下面是完整的 `build.gradle`文件：

``` gradle
plugins {
	id 'org.springframework.boot' version '2.3.2.RELEASE'
	id 'io.spring.dependency-management' version '1.0.8.RELEASE'
	id 'java'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '1.8'

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	implementation 'org.springframework.boot:spring-boot-starter-security'
	implementation 'org.springframework.security:spring-security-test'
	testImplementation('org.springframework.boot:spring-boot-starter-test') {
		exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
	}
}

test {
	useJUnitPlatform()
}

```

  使用 Maven 需要添加一下 2 部分（一个用于应用，一个用于测试）到  `pom.xml` 文件的 `<denpendencies>`元素下：

``` xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.security</groupId>
  <artifactId>spring-security-test</artifactId>
  <scope>test</scope>
</dependency>
```

  下面是完整的 `pom.xml`文件：

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.3.2.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.example</groupId>
	<artifactId>securing-web</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>securing-web</name>
	<description>Demo project for Spring Boot</description>

	<properties>
		<java.version>1.8</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-thymeleaf</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.security</groupId>
			<artifactId>spring-security-test</artifactId>
			<scope>test</scope>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
			<exclusions>
				<exclusion>
					<groupId>org.junit.vintage</groupId>
					<artifactId>junit-vintage-engine</artifactId>
				</exclusion>
			</exclusions>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```

  以下安全配置（位于 `src/main/java/com/example/securingweb/WebSecurityConfig.java`）确保只有鉴权了的用户才能看到欢迎页：

``` java
package com.example.securingweb;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
			.authorizeRequests()
				.antMatchers("/", "/home").permitAll()
				.anyRequest().authenticated()
				.and()
			.formLogin()
				.loginPage("/login")
				.permitAll()
				.and()
			.logout()
				.permitAll();
	}

	@Bean
	@Override
	public UserDetailsService userDetailsService() {
		UserDetails user =
			 User.withDefaultPasswordEncoder()
				.username("user")
				.password("password")
				.roles("USER")
				.build();

		return new InMemoryUserDetailsManager(user);
	}
}
```

  `WebSecurityConfig`类被 `@EnableWebSecurity` 注解了，启用了 Spring Security 的 web 安全支持并提供了 Spring MVC  的集成。同时继承了 `WebSecurityConfigurerAdapter`类，重写了一组方法用来配置一些特定的 web 安全配置。

  `configure(HttpSecurity)` 方法定义了哪些 URL 路径需要被鉴权。这里 `/` 和 `/home` 特别被标注不要鉴权，其他所有路径都要被鉴权。

  当用户成功登录后，他们被重定向到之前请求的需要鉴权的页面。有一个自定义的 `/login` 页面（使用 `loginPage()` 指定），任何人都能访问。

  `userDetailsService()`方法设置了单个用户的内存存储，给定了用户名为 `user`，密码为 `password`，角色为 `USER`。

  现在需要创建登录页。已经有了 `login` 视图的视图控制器了，只需要创建视图即可，如下（位于 `src/main/resources/templates/login.html`）：

``` html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="https://www.thymeleaf.org"
      xmlns:sec="https://www.thymeleaf.org/thymeleaf-extras-springsecurity3">
    <head>
        <title>Spring Security Example </title>
    </head>
    <body>
        <div th:if="${param.error}">
            Invalid username and password.
        </div>
        <div th:if="${param.logout}">
            You have been logged out.
        </div>
        <form th:action="@{/login}" method="post">
            <div><label> User Name : <input type="text" name="username"/> </label></div>
            <div><label> Password: <input type="password" name="password"/> </label></div>
            <div><input type="submit" value="Sign In"/></div>
        </form>
    </body>
</html>
```

  Themeleaf 模板展示了一个记录用户名和密码的表单，并 post 方法传到 `/login`。Spring Security 配置后，提供一个拦截请求的过滤器并对用户鉴权。如果用户鉴权失败则会重定向到 `/login?error`，并且展示相关的错误信息。一旦成功登出，应用会重定向到 `/login?logout`，并且页面会展示成功信息。

  最后，你需要提供访问者一种展示当前用户和登出的方式。因此，更新 `hello.html` 向当前用户打招呼并增加一个 `Sign Out` 表单，如下（位于 `src/main/resources/templates/hello.html`）：

``` html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="https://www.thymeleaf.org"
      xmlns:sec="https://www.thymeleaf.org/thymeleaf-extras-springsecurity3">
    <head>
        <title>Hello World!</title>
    </head>
    <body>
        <h1 th:inline="text">Hello [[${#httpServletRequest.remoteUser}]]!</h1>
        <form th:action="@{/logout}" method="post">
            <input type="submit" value="Sign Out"/>
        </form>
    </body>
</html>
```

  使用 Spring Security 集成的 `HttpServletRequest#getRemoteUser()`来展示用户名。登出表单提交一个 POST 请求到 `/logout`。当成功登出后，用户会重定向到 `/login?logout`。

## 运行应用

  Spring 创建器已经为你创建了一个应用类。此时你不需要修改这个类。下面展示了这个应用启动类（位于 `src/main/java/com/example/securingweb/SecuringWebApplication.java`）：

``` java
package com.example.securingweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SecuringWebApplication {

	public static void main(String[] args) throws Throwable {
		SpringApplication.run(SecuringWebApplication.class, args);
	}

}
```

### 构建可执行 JAR 文件

  可以在命令行使用 Gradle 或 Maven 运行这个应用程序。也可以构建一个包含所有依赖、类和资源的可执行的 JAR 文件并直接运行它。构建 JAR 文件更方便去在开发生命周期中跨环境打包，版本管理和部署服务。

  如果使用 Gradle，可以使用 `./gradlew bootRun` 启动应用。或者也可以用 `./gradlew build` 构建 JAR 文件然后用下面命令运行这个 JAR 文件：

``` bash
java -jar build/libs/gs-securng-web-0.1.0.jar
```

  如果使用 Maven，可以使用 `./mvnw spring-boot:run` 启动应用。或者也可以用 	`./mvnw clean package` 构建 JAR 文件然后用下面命令运行这个 JAR 文件：

``` bash
java -jar target/gs-securing-web-0.1.0.jar
```

  一旦项目启动，在浏览器中打开 `http://localhost:8080`。你将会看到主页，如下图：

> Image is dead :(

  当你点击链接，会尝试将你带到 `hello` 的欢迎页。但是该页面是需要鉴权的，并且你还没登录，所以会重定向到登录页，如下图:

> Image is dead :(

> 如果你是直接跳到这里，是未接入鉴权的版本，将不会看到登录页。需要返回去继续写剩下鉴权的代码。


  在登录页，使用测试用户登录，分别使用 `user` 和 `password` 填入用户名和密码框。提交登录表单，将会被成功鉴权并重定向到欢迎页，如下图：

> Image is dead :(

  如果点击登出按钮，鉴权将会被注销，会返回到登录页，并有一条提示信息，告知你已经登出了。

## 总结

  恭喜！你已经开发了一个简单的用 Spring Security 鉴权的 web 应用。