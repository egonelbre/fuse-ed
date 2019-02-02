(function(context) {
	'use strict';

	var MenuButton = React.createClass({
		getInitialProps: function() {
			return {
				icon: ""
			};
		},
		render: function() {
			return React.DOM.div({
				className: "button",
				style: {
					backgroundImage: "url('" + this.props.icon + "')"
				}
			});
		}
	});

	var ToggleButton = React.createClass({
		getInitialState: function() {
			return {
				down: false
			};
		},
		getInitialProps: function() {
			return {
				icon: ""
			};
		},
		onClick: function() {
			this.setState({
				down: !this.state.down
			});
		},
		render: function() {
			return React.DOM.div({
				onClick: this.onClick,
				className: "toggle " + (this.state.down ? "toggle-down" : "toggle-up"),
				style: {
					backgroundImage: "url('" + this.props.icon + "')"
				}
			});
		}
	});

	var Menu = React.createClass({
		render: function() {
			return React.DOM.div({
				id: "main-menu"
			}, [
				new MenuButton({
					icon: "static/icons/delete.png"
				}),
				new ToggleButton({
					icon: "static/icons/select.png"
				})
			]);
		}
	});

	var App = React.createClass({
		getInitialState: function() {
			return {
				size: {
					x: this.props.size.x,
					y: this.props.size.y
				}
			};
		},
		render: function() {
			return React.DOM.div({
				id: "app"
			}, [
				new Menu(),
				new React.DOM.svg({
					width: this.state.size.x,
					height: this.state.size.y
				}, React.DOM.g({
					className: "view"
				}))
			]);
		}
	});

	context.App = App;
}(this));